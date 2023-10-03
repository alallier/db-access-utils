const DBConfig = require('./DBConfig')

/**
 * PostgreSQL database connection configuration
 * @class PostgresDBConfig
 * @extends DBConfig
 * @property {number} [maxClients] - Maximum number of clients a connection pool
 * should contain. Defaults to 10.
 * @property {number} [idleTimeoutMillis] - Number of milliseconds a client from
 * the pool sits idle before being automatically disconnected. Defaults to 10000.
 * Setting this property to 0 disables the auto-disconnect feature.
 * @property {number} [connectionTimeoutMillis] - Number of milliseconds before
 * timing out when connecting a new client. Defaults to 0, disabling the
 * connection timeout feature.
 */
class PostgresDBConfig extends DBConfig {

  /**
   * Constructor
   * @param {string} hostname
   * @param {number} port
   * @param {string} database
   * @param {string} username
   * @param {string} password
   * @param {Object} [opts] - Options object
   * @param {number} [opts.maxClients] - Maximum number of clients a connection
   * pool should contain. Defaults to 10.
   * @param {number} [opts.idleTimeoutMillis] - Number of milliseconds a client
   * from the pool sits idle before being automatically disconnected. Defaults
   * to 10000. Setting this property to 0 disables the auto-disconnect feature.
   * @param {number} [opts.connectionTimeoutMillis] - Number of milliseconds
   * before timing out when connecting a new client. Defaults to 0, disabling
   * the connection timeout feature.
   */
  constructor (hostname, port, database, username, password, opts) {
    super('postgres', hostname, port, database, username, password)

    this.maxClients = opts && opts.maxClients || 10
    this.idleTimeoutMillis = opts && opts.idleTimeoutMillis || 10000
    this.connectionTimeoutMillis = opts && opts.connectionTimeoutMillis || 0
  }
}

module.exports = PostgresDBConfig
