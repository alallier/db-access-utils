# Database Access Utility Library

A library that allows Node.js applications to setup database connection, data access and persistence operations quickly and easily.

## Installation
Install this dependency in your Node.js application using the NPM command:

```
npm i db-access-utils
```

## Usage

The following sections outline various use cases for performing data access using this library, starting with the most basic usage to get you up and running.

### Basic usage

Start by creating a `DBConfig` object using the configuration JS class for the database vendor you intend on using. For example, if you are using a PostgreSQL database, instantiate a `PostgresDBConfig` instance.

**Instantiate a configuration object for PostgreSQL databases**
```js
const { PostgresDBConfig } = require('db-access-utils')

const options = {
  maxClients: 5,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000
}
const dbConfig = new PostgresDBConfig(hostname,
  port,
  database,
  username,
  password,
  options)
```

Using the configuration object, instantiate a `DB` object for the database vendor you are using and start the connection using the `DB.connect` function. For example, if you are using PostgreSQL, instantiate a `PostgresDB` instance. This DB type object will be used for low-level connection management and data access operations. Each subtype of the `DB` class, corresponding to a different database vendor, will **implement the same interface**.

**Instantiate and connect a DB object for PostgreSQL databases**
```js
const { PostgresDB } = require('db-access-utils')

const db = new PostgresDB(dbConfig)
try {
  await db.connect()
} catch (e) {
  console.log('Unable to connect to postgres')
}
```

Execute a query statement using the `DB.query` function. This function takes two arguments:

  1. Statement - A query statement string
  2. Options - An optional options object with the following properties:
      - `parameters` - An array of query parameters (Optional)

**Execute a query**
```js
// Basic query statement without parameters
const statement1 = 'SELECT * FROM students'
try {
  let dbResult = await db.query(statement1)
} catch (e) {
  console.log('An error has occurred attempting to execute the query')
}

// Query with parameters
const statement2 = 'SELECT * FROM departments WHERE name=$1'
const parameters = [ 'CS' ]
try {
  let dbResult = await db.query(statement2, { parameters })
} catch (e) {
  console.log('An error has occurred attempting to execute the query')
}
```

Once you're finished using the `DB` object, such as during application teardown, disconnect from the database using the `DB.disconnect` function.

**Disconnect from the database**
```js
try {
  await db.disconnect()
} catch (e) {
  console.log('An error occurred while disconnecting from the database')
}
```

### ES Module Loading

You may also import the library's named exports as ECMAScript modules. The project includes a wrapper around the exports so that you can import modules using ES Module loading and ESM `import` statements.

```js
import { PostgresDB, DBOperation } from 'db-access-utils'
```

### Query operations
The `DB` classes allow you to execute an operation instead of a simple query statement. This operation allows you to specify:

  - The query statement string
  - The query parameters (Optional)
  - A data marshaller function to marshall the raw `DBResult` into the appropriate type (Optional)

This may be useful if you're designing a higher level DAO abstraction on top of the low-level data access this library provides. Use the `DBOperation` type along with `DB.operation` to perform operations.

**Performing a database operation**
```js
const { DBOperation } = require('db-access-utils')

const statement = 'SELECT * FROM professors WHERE lastname=$1'
const professorMarshallerFn = dbResult => {
  return dbResult.rows.map(row => {
    return {
      firstName: row.firstname,
      lastName: row.lastname,
      departmentId: row.department_id
      dateOfBirth: row.date_of_birth,
    }
  })
const getProfessorByLastName = new DBOperation(statement,
{
  marshaller: professorMarshallerFn
})

try {
  const professors = await db.operation(getProfessorByLastName,
  {
    parameters: [ 'Smith' ]
  })
} catch (e) {
  console.log('An error has occurred attempting to execute the query')
}
```

If a marshaller function is provided, the function will receive the raw `DBResult` object normally returned from a query execution, and execute the function to return an array of marshalled results (Returns an `Array<*>` type).

If the optional options object is provided to the `DB.operation` function call that defines `parameters`, the `DBOperation.parameters` will be overriden in the database operation execution. This allows you to defer knowing the operation parameters until you're ready to execute the operation (Useful for defining operations ahead of time when parameters aren't known until runtime).

### Transactions
The `DB.transaction` function allows you to perform a sequential list of database operations in a single unit of work. In the case that any of the operations fail, the previous operations will be rolled back.

To perform a transaction, create a `DBOperation` for each operation in the transaction, and execute the transaction using the `DB.transaction` function with all operations in an ordered Array of objects containing each operation and any parameters.

**Performing a database transaction**
```js
const { DBOperation } = require('db-access-utils')

const op1 = new DBOperation('INSERT INTO buildings VALUES ( $1, $2 )')
const op2 = new DBOperation('INSERT INTO departments VALUES ($1, $2 )')

const operations = [
  {
    operation: op1,
    parameters: [ '103', 'New Athletic Center' ]
  },
  {
    operation: op2,
    parameters: [ 'PE', '103' ]
  }
]

try {
  const dbResults = await db.transaction(operations)
} catch (e) {
  console.log('An error occurred while performing a transaction. Transaction rolled back')
}
```

### Using the DBFactory module
Instead of explicitly creating the `DB` subtype, you may use the `DBFactory` module to create the appropriate `DB` instance by providing it a database configuration object. The configuration object should be a flat object defining the properties for the database's `DBConfig`, as well as define a `vendor` field with the appropriate vendor name.

The `DBFactory.createDB` method will inspect the database configuration object, determine which `DB` subtype to instantiate, and return it. This method determines the `DB` subtype using the `config.vendor` property, and marshalling the `config` properties into the appropriate `DBConfig` for that vendor's `DB` subclass. The supported vendors are:

- "postgres" - PostgreSQL database

This is useful if your application can't anticipate the correct `DB` subclass to use until runtime loading a configuration.

**Using DBFactory to create a DB instance**
```js
const { DBFactory } = require('db-access-utils')
const config = require('./path/to/db/config') // Imported object defines a config.vendor field

try {
  const db = DBFactory.createDB(config)
} catch (e) {
  console.log('Failed to instantiate DB using the DBFactory')
}
```

## API
Library API

### PostgresDBConfig
Configuration object for `PostgresDB` instances.

#### Constructor

```
new PostgresDBConfig(<string>hostname, <number>port, <string>database, <string>username, <string>password, <Object>opts)
```

The `opts` argument is an object with the following properties:
  - `maxClients`: (number) Maximum number of clients in the connection pool. Optional, defaults to 10.
  - `idleTimeoutMillis`: (number) Milliseconds a client in the pool will sit idle before being disconnected. Setting this to 0 disables the auto-disconnect feature. Optional, defaults to 10000.
  - `connectionTimeoutMillis`: (number) Milliseconds before timing out a connected client. Setting this to 0 disables the auto-timeout feature. Optional, defaults to 0.

### PostgresDB
PostgreSQL database access object.

#### Constructor

```
new PostgresDB(<PostgresDBConfig>config)
```

#### DB.connect

```
db.connect() : Promise<void> throws DBConnectionError
```

Connects to the database. Applies to all subtypes of `DB`, such as `PostgresDB`.

#### DB.disconnect

```
db.disconnect() : Promise<void> throws Error
```

Disconnects from the database. Applies to all subtypes of `DB`, such as `PostgresDB`.

#### DB.query

```
db.query(<string>statement[, opts: [<Array<*>>parameters]]) : Promise<DBResult> throws DBConnectionError, QueryExecutionError
```

Executes a database query using the provided query statemeent.

If an `opts.parameters` array property is provided, executes the query with the query parameters.

Returns a `DBResult` object.

Executes a database query. May take a plain text query statement, or a `DBOperation` object that defines the statement, optional parameters, and optional results marshaller function.

If a `DBOperation` object is provided that contains the query parameters, the query parameters provided to this function will be ignored.

If a plain text query or a `DBOperation` object without a marshaller function defined is used, a `DBResult` object is returned.

If a `DBOperation` is used and defines a marshaller function, the query function will return the Array of `*` returned from the marshaller function.

#### DB.operation

```
db.operation(<DBOperation>operation[, opts: [<Array<*>>parameters]]) : Promise<DBResult>|Promise<Array<*>> throws DBConnectionError, QueryExecutionError, DBMarshallerError
```

Executes a database operation with the provided `DBOperation` operation.

Returns a `DBResult` if the operation does not define a data marshaller function, or an `Array<*>` if a data marshaller is provided.

May take a `opts.parameters` array if the caller wishes to override the operation's existing parameters.

#### DB.transaction

```
db.transaction(Array<DBOperation>operations[, opts: [<Array<Array<*>>>parameters]]) : Promise<Array<DBResult>>|Promise<Array<Array<*>>> throws DBConnectionError, QueryExecutionError, DBResultMarshallerError
```

Executes a ordered list of operations sequentially in a single database transaction/unit of work. Returns an ordered list of `DBResult` objects whose index corresponds to the provided operation.

If the `DBOperation` defines a marshaller function, the object in the results array at the index corresponding to the operation will be the return value from the data marshaller function instead.

May take an `opts.parameters` ordered array of query parameters if the caller wishes to override a operation's existing parameters. The array in the `opts.parameters` array will replace the operation's query parameters in the same index. For example, if `opts.parameters` is provided, the array of query parameters in index 1 of `opts.parameters` will replace the query parameters for the operation in index 1 of `operations`. A `null` in the `opts.parameters` array will skip query parameter overriding for that operation in the same index.

### DBOperation
Defines a database operation executed.

#### Constructor

```
new DBOperation(<string>statement[, opts: [ <Array<*>>parameters[, <Function>marshaller]]])
```

May take an `opts` options object.

The `opts.parameters` may be an array of query parameters.

The `opts.marshaller` may be a function that executes on the database operation's returned `DBResult` object for marshalling the results into a particular list of objects instead.

The **marshaller** function has the following function signature, where the return type is the data marshalled by the function from the DBResult rows:

```
marshallerFn(<DBResult>dbResult) : Array<*>
```

### DBResult
Represents the raw results of a database query or transaction

#### Constructor

```
new DBResult([<Array<Object>>rows[, <number>rowCount[, <Array<Object>>fields]]])
```

#### DBResult.setRows

```
DBResult.setRows(<Array<Object>>rows) : void
```

Sets the `DBResult.rows` property. Each row object represents a row returned from a database query/operation.

#### DBResult.setRowCount

```
DBResult.setRows(<number>rowCount) : void
```

Sets the `DBResult.rowCount` property. The number of rows in the query result.

#### DBResult.setFields

```
DBResult.setFields(<Array<Object>>fields) : void
```

Sets the `DBResult.fields` property. A list of 'field' objects containing metadata for each row object field.

Each field object contains a `name` property that corresponds to a row object property name.

### DBFactory
Object that defines shortcut functions for creating a `DB` subtype.

#### DBFactory.createDB

```
DBFactory.createDB(<Object>config) : DB throws DBFactoryError
```

A factory method that creates an appropriate `DB` instance for the given configuration object. Used as an alternative to creating the `DBConfig` and `DB` subtype instances manually.

Inspects the provided `config` object to determine what subtype of `DB` to instantiate and return. The `config` object should define a `vendor` field with the appropriate vendor name, and all fields defined in the appropriate `DBConfig` subclass as a direct child property.

### DBFactoryError
An error thrown when an error occurs creating a `DB` instance using the `DBFactory.createDB` method

#### Constructor

```
new DBFactoryError(<string>message, <Error>cause)
```

#### DBFactoryError.cause

The thrown error that caused with error to throw.


### DBConnectionError
An error thrown by a `DB` function when there is an error with the database connection.

#### Constructor

```
new DBConnectionError(<string>message, <Error>cause)
```

#### DBConnectionError.cause

The thrown error that caused with error to throw.

### QueryExecutionError
An error thrown when a database query or transaction fails to execute.

#### Constructor

```
new QueryExecutionError(<string>message, <Error>cause)
```

#### QueryExecutionError.cause

The thrown error that caused with error to throw.

### DBResultMarshallerError
An error thrown when an error occurs in a database operation's results marshaller function.

#### Constructor

```
new DBResultMarshallerError(<string>message, <Error>cause)
```

#### DBResultMarshallerError.cause

The thrown error that caused with error to throw.
