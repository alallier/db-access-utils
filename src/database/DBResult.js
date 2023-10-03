/**
 * Database query result
 * @class DBResult
 * @property {Array<Object>} rows - Array of "row" objects. Each object contains
 * properties corresponding to the columns in the returned row.
 * @property {number} rowCount - Number of rows returned
 * @property {Array<Object>} fields - Array of objects that describe each column
 * or field in the returned row(s).
 * @property {string} fields[].name - Name of the column or field
 */
class DBResult {
  constructor(rows, rowCount, fields) {
    this.rows = Array.isArray(rows) ? rows : null
    this.rowCount = typeof rowCount === 'number' ? rowCount : null
    this.fields = Array.isArray(fields) ? fields : null
  }

  /**
   * Sets the rows property
   * @param {Array<Object>} rows
   */
  setRows (rows) {
    this.rows = rows
  }

  /**
   * Sets the row count
   * @param {number} rowCount
   */
  setRowCount(rowCount) {
    this.rowCount = rowCount
  }

  /**
   * Sets the fields
   * @param {Array<Object>} fields
   */
  setFields(fields) {
    this.fields = fields
  }
}

module.exports = DBResult
