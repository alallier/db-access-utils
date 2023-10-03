const DBResult = require('./DBResult')

/**
 * Data marshaller function to marshall DBResult query result objects into their
 * appropriate data type.
 * @function marshaller
 * @param {DBResult} dbResult - DBResult object
 * @return {Array<*>} List of types marshalled from the DBResult object
 * @throws {DBResultMarshallerError} Thrown if the marshaller fails to marshall
 * the results into their appropriate type.
 */

/**
 * Database operation
 * @class DBOperation
 * @property {string} statement - Query statement
 * @property {?Array<*>} parameters - Query parameters. Null, if no query
 * parameters defined for the operation.
 * @property {?marshaller} marshaller - Marshaller function for the query
 * DBResults. Marshalls the DBResult.rows into the appropriate data type. Null,
 * if the operation should return the raw DBResult object(s) instead.
 */
class DBOperation {

  /**
   * Constructor
   * @param {string} statement - Query statement
   * @param {Object} [opts] - Options
   * @param {Array<*>} [opts.parameters] - List of query parameters
   * @param {marshaller} [opts.marshaller] - Marshaller function to marshall the
   * DBResult rows into a list of objects.
   */
  constructor (statement, opts = {}) {
    this.statement = statement
    this.parameters = Array.isArray(opts.parameters) ? opts.parameters : null
    this.marshaller = typeof opts.marshaller === 'function' ? opts.marshaller : null
  }
}

module.exports = DBOperation
