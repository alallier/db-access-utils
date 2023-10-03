/**
 * Entrypoint ES module. ESM wrapper for this library's CommonJS modules to
 * allow applications to import the library using ES module loading.
 */

/* Configurations */
export { default as DBConfig } from '../src/configuration/DBConfig.js'
export { default as PostgresDBConfig } from '../src/configuration/PostgresDBConfig.js'

/* Data access */
export { default as DB } from '../src/database/DB.js'
export { default as PostgresDB } from '../src/database/PostgresDB.js'
import _DBFactory from '../src/database/DBFactory.js'
export const DBFactory = {
  createDB: _DBFactory.createDB
}

/* Argument/Return types */
export { default as DBOperation } from '../src/database/DBOperation.js'
export { default as DBResult } from '../src/database/DBResult.js'

/* Errors */
export { default as DBConnectionError } from '../src/error/DBConnectionError.js'
export { default as DBResultMarshallerError } from '../src/error/DBResultMarshallerError.js'
export { default as QueryExecutionError } from '../src/error/QueryExecutionError.js'
