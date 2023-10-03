const PostgresDB = require('./PostgresDB')
const PostgresDBConfig = require('../configuration/PostgresDBConfig')
const DBFactoryError = require('../error/DBFactoryError')

/**
 * Creates the appropriate DB subtype instance for the given database
 * configuration. Note that the returned DB connection is NOT initialized.
 * @param {Object} config - Database configuration object
 * @param {string} config.vendor - Database vendor name. Must be a vendor
 * supported by this library.
 * @return {DB} Returns a DB instance
 * @throws {DBFactoryError} Thrown if the function is unable to create the
 * appropriate DB instance
 */
function createDB (config) {
  if (typeof config.vendor !== 'string') {
    throw new DBFactoryError('The config argument must define a "vendor" string property')
  }

  switch(config.vendor.toLowerCase()) {
    case 'postgres':
      return createPostgresDB(config)
    default:
      throw new DBFactoryError('Failed to create DB instance. Unsupported vendor specified in configuration')
  }
}

/**
 * Creates a PostgresDB instance
 * @param {Object} config - PostgresDB config object
 * @return {PostgresDB} Returns a new PostgresDB instance
 */
function createPostgresDB (config) {
  let postgresDBConfig = new PostgresDBConfig(config.hostname,
    config.port,
    config.database,
    config.username,
    config.password,
    {
      maxClients: config.maxClients,
      idleTimeoutMillis: config.idleTimeoutMillis,
      connectionTimeoutMillis: config.connectionTimeoutMillis
    })
  return new PostgresDB(postgresDBConfig)
}

exports.createDB = createDB
