/**
 * Error thrown when the database connection fails
 * @class DBConnectionError
 * @extends Error
 * @property {string} name - Error name
 * @property {Error} cause - Causing error
 */
class DBConnectionError extends Error {

  /**
   * Constructor
   * @param {string} message - Error message
   * @param {Error} cause - Causing error
   */
  constructor (message, cause) {
    super(message)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DBConnectionError)
    }

    this.name = 'DBConnectionError'
    this.cause = cause
  }
}

module.exports = DBConnectionError
