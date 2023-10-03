/**
 * Error thrown when the DBFactory.createDB method fails to create a DB instance
 * @class DBFactoryError
 * @extends Error
 * @property {string} name - Error name
 * @property {Error} cause - Causing error
 */
class DBFactoryError extends Error {

  /**
   * Constructor
   * @param {string} message - Error message
   * @param {Error} cause - Causing error
   */
  constructor (message, cause) {
    super(message)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DBFactoryError)
    }

    this.name = 'DBFactoryError'
    this.cause = cause
  }
}

module.exports = DBFactoryError
