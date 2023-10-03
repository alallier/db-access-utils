/**
 * Entrypoint module. Re-exports/aggregates individual package exports into
 * named exports of this package.
 */

/* Configurations */
exports.DBConfig = require('./src/configuration/DBConfig')
exports.PostgresDBConfig = require('./src/configuration/PostgresDBConfig')

/* Data access */
exports.DB = require('./src/database/DB')
exports.PostgresDB = require('./src/database/PostgresDB')
exports.DBFactory = require('./src/database/DBFactory')

/* Argument/Return types */
exports.DBOperation = require('./src/database/DBOperation')
exports.DBResult = require('./src/database/DBResult')

/* Errors */
exports.DBConnectionError = require('./src/error/DBConnectionError')
exports.DBResultMarshallerError = require('./src/error/DBResultMarshallerError')
exports.QueryExecutionError = require('./src/error/QueryExecutionError')
