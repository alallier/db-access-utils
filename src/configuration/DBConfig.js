/**
 * Abstract database connection configuration
 * @class DBConfig
 * @property {string} vendor - Database vendor name. Used to identify the type
 * of database this configuration is meant for.
 * @property {string} hostname - Hostname
 * @property {number} port - Port number
 * @property {string} database - Database name
 * @property {string} username - Database username
 * @property {string} password - Database user password
 */
class DBConfig {

  /**
   * Constructor
   * @param {string} vendor - Database vendor name
   * @param {string} hostname - Hostname
   * @param {number} port - Port number
   * @param {string} database - Database name
   * @param {string} username - Database username
   * @param {string} password - Database user password
   */
  constructor (vendor, hostname, port, database, username, password) {
    this.vendor = vendor
    this.hostname = hostname
    this.port = port
    this.database = database
    this.username = username
    this.password = password
  }
}

module.exports = DBConfig
