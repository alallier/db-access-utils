const { Pool } = require('pg')
const DB = require('./DB')
const DBConnectionError = require('../error/DBConnectionError')
const DBOperation = require('./DBOperation')
const DBResult = require('./DBResult')
const QueryExecutionError = require('../error/QueryExecutionError')

/**
 * PostgreSQL database
 * @class PostgresDB
 */
class PostgresDB extends DB {
  /**
   * Constructor
   * @param {PostgresDBConfig} postgresDBConfig - Postgres database connection
   * configuration
   */
  constructor (postgresDBConfig) {
    super(postgresDBConfig)
    this.maxClients = postgresDBConfig.maxClients
    this.idleTimeoutMillis = postgresDBConfig.idleTimeoutMillis
    this.connectionTimeoutMillis = postgresDBConfig.connectionTimeoutMillis

    this.pool = null
  }

  /**
   * Initiates PostgreSQL database connection
   * @throws {DBConnectionError} Thrown if the database connection fails
   */
  async connect () {
    this.pool = new Pool({
      host: this.hostname,
      port: this.port,
      database: this.database,
      user: this.username,
      password: this.password,
      max: this.maxClients,
      idleTimeoutMillis: this.idleTimeoutMillis,
      connectionTimeoutMillis: this.connectionTimeoutMillis
    })

    try {
      const client = await this.pool.connect()
      client.release()
    } catch (e) {
      throw new DBConnectionError('Database unavailable', e)
    }
  }

  /**
   * Ends the PostgreSQL database connection
   */
  async disconnect () {
    await this.pool.end()
  }

  /**
   * Executes the given database queries in a transaction. If any query fails,
   * the transaction is aborted, rolled back, and an error thrown.
   *
   * @param {Array<Object>>} - operations - List of database operations.
   * @param {DBOperation} - operations.operation - database operation.
   * @param {Array<*>} - [operations.parameters] - Operation parameters.
   * @return {Array<Array<*>>|Array<DBResult>} Returns a 2D list of results returned
   * from each operation, where each index results corresponds to the indexed
   * operation in the operations argument. If the operation defines a marshaller
   * function, the results will be an array of the marshaller returned type. If
   * the operation does not define a marshaller function, the results will be a
   * DBResult object.
   *
   * @throws {DBConnectionError} Thrown if the database connection fails
   * @throws {QueryExecutionError} Throw if a database query fails to execute
   * @throws {DBResultMarshallerError} Thrown if the database operation results
   * marshaller fails to marshall the query results into the return type. Only
   * thrown if the operation defines a results marshaller function.
   */
  async transaction (operations) {
    let client
    const rollback = async () => {
      try {
        await client.query('ROLLBACK')
      } catch (e) {
        throw new QueryExecutionError('Error occurred while rolling back DB transaction', e)
      }
    }
    const results = []

    if (this.pool === null) {
      throw new DBConnectionError('Not connected to PostgreSQL database. Please check that that database client pool is connected by calling the connect() method.')
    }

    try {
      client = await this.pool.connect()
    } catch (e) {
      throw new DatabaseConnectionError('Database Unavailable')
    }

    let operation, parameters

    try {
      // Begin transaction
      await client.query('BEGIN')

      // Execute operations (sequentially)
      for (let i = 0; i < operations.length; i++) {
        const op = operations[i]

        operation = op.operation
        parameters = op.parameters

        const statement = operation.statement
        parameters = operation.parameters || parameters
        const marshaller = operation.marshaller
        let result

        if (Array.isArray(parameters) && parameters.length > 0) {
          result = this.unmarshallPgResult(await client.query(statement, parameters))
        } else {
          result = this.unmarshallPgResult(await client.query(statement))
        }

        if (marshaller) {
          result = marshaller(result)
        }
        results.push(result)
      }

      // Commit transaction
      await client.query('COMMIT')
    } catch (e) {
      await rollback()
      throw new QueryExecutionError('An error occurred executing a database transaction', e)
    } finally {
      client.release()
    }

    return results
  }

  /**
   * Executes the given database query
   * @param {string} operation - Database query statement
   * @param {Object} [opts] - Query options (Optional)
   * @param {Array<*>} [opts.parameters] - Query parameters (Optional)
   * @return {DBResult} Returns a DBResult object
   * @throws {DBConnectionError} Thrown if the database connection fails
   * @throws {QueryExecutionError} Thrown if the database query fails to execute
   */
  async query (statement, opts = {}) {
    let client
    let parameters = Array.isArray(opts.parameters) ? opts.parameters : null

    if (this.pool === null) {
      throw new DBConnectionError('Not connected to PostgreSQL database. Please check that that database client pool is connected by calling the connect() method.')
    }

    try {
      client = await this.pool.connect()
    } catch (e) {
      throw new DBConnectionError('Database unavailable', e)
    }

    let dbResult
    try {
      if (parameters === null || parameters.length === 0) {
        dbResult = this.unmarshallPgResult(await client.query(statement))
      } else {
        dbResult = this.unmarshallPgResult(await client.query(statement, parameters))
      }
    } catch (e) {
      throw new QueryExecutionError('An error occurred executing query', e)
    } finally {
      client.release()
    }

    return dbResult
  }

  /**
   * Executes a database operation
   * @param {DBOperation} operation - Database operation
   * @param {Object} [opts] - Options object
   * @param {Array<*>} [opts.parameters] - Operation query parameters
   * @return {DBResult|Array<*>} Returns a DBResult object, or if an marshaller
   * function is defined in the provided operation, returns a list of * returned
   * by the marshaller function execution.
   * @throws {DBConnectionError} Thrown if the database connection fails
   * @throws {QueryExecutionError} Thrown if the database query fails to execute
   * @throws {DBResultMarshallerError} Thrown if the database operation results
   * marshaller fails to marshall the query results into the return type. Only
   * thrown if the operation defines a results marshaller function.
   */
  async operation (operation, opts = {}) {
    let statement = operation.statement
    let parameters = Array.isArray(opts.parameters) ? opts.parameters : operation.parameters
    let marshaller = operation.marshaller
    let client

    if (this.pool === null) {
      throw new DBConnectionError('Not connected to PostgreSQL database. Please check that that database client pool is connected by calling the connect() method.')
    }

    try {
      client = await this.pool.connect()
    } catch (e) {
      throw new DBConnectionError('Database unavailable', e)
    }

    let dbResult
    try {
      if (parameters === null || parameters.length === 0) {
        dbResult = this.unmarshallPgResult(await client.query(statement))
      } else {
        dbResult = this.unmarshallPgResult(await client.query(statement, parameters))
      }
    } catch (e) {
      throw new QueryExecutionError('An error occurred executing query', e)
    } finally {
      client.release()
    }

    if (marshaller) {
      return marshaller(dbResult)
    }
    return dbResult
  }

  /**
   * Unmarshalls the node-pg Result into a DBResult
   * @param {Object} pgResult - Node-pg Result object. See
   * Documentation: https://node-postgres.com/api/result
   * @return {DBResult} Returns a DBResult object
   */
  unmarshallPgResult (pgResult) {
    const dbResult = new DBResult()

    dbResult.setRows(pgResult.rows)
    dbResult.setRowCount(pgResult.rowCount)
    dbResult.setFields(pgResult.fields)

    return dbResult
  }
}

module.exports = PostgresDB
