/**
 * Error thrown when a database query fails to execute
 * @class QueryExecutionError
 * @extends Error
 * @property {string} name - Error name
 * @property {Error} cause - Causing error
 */
class QueryExecutionError extends Error {

  /**
   * Constructor
   * @param {string} message - Error message
   * @param {Error} cause - Causing error
   */
  constructor (message, cause) {
    super(message)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, QueryExecutionError)
    }

    this.name = 'QueryExecutionError'
    this.cause = cause
  }
}

module.exports = QueryExecutionError
