/**
 * Error thrown when failing to marshall the results of a database query
 * @class DBResultMarshallerError
 * @extends Error
 * @property {string} name - Error name
 * @property {Error} cause - Causing error
 */
class DBResultMarshallerError extends Error {

  /**
   * Constructor
   * @param {string} message - Error message
   * @param {Error} cause - Causing error
   */
  constructor (message, cause) {
    super(message)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DBResultMarshallerError)
    }

    this.name = 'DBResultMarshallerError'
    this.cause = cause
  }
}

module.exports = DBResultMarshallerError
