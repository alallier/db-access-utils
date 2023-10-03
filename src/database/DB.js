/**
 * Abstract database interface
 * @class DB
 */
class DB {

  /**
   * Constructor
   * @param {DBConfig} dbConfig - Database connection configuration
   */
  constructor(dbConfig) {
    this.hostname = dbConfig.hostname
    this.port = dbConfig.port
    this.database = dbConfig.database
    this.username = dbConfig.username
    this.password = dbConfig.password
  }
}

module.exports = DB
