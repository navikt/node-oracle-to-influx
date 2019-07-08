const logger = require('./logger')
module.exports = async function ensureSchemaExists (connection, schema) {
  const testPassword = 'xxx'
  const schemaExistsResult = await connection.execute(`SELECT count(*)  FROM dba_users WHERE USERNAME='${schema}'`)
  if (schemaExistsResult.rows[0][0] === 0) {
    logger('Schema doesnt, exists will create schema.')
    await connection.execute(`CREATE USER ${schema} IDENTIFIED BY ${testPassword}`)
  }
  await connection.execute(`ALTER SESSION SET CURRENT_SCHEMA = ${schema} TIME_ZONE = DBTIMEZONE`)
  await connection.execute(`ALTER USER ${schema} quota unlimited on USERS`)
  await connection.execute(`ALTER USER ${schema} quota unlimited on SYSTEM`)
}
