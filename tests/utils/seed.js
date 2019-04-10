const oracledb = require('oracledb')
const findConfig = require('./config').find
const logger = require('./logger')
module.exports = async function seedDatabase (numberOfRows, testTable) {
  const testPassword = 'xxx'

  oracledb.autoCommit = true

  const config = findConfig('someMeasurement', 'prod')

  const connection = await oracledb.getConnection(config.oraOptions)

  const schemaExistsResult = await connection.execute(`SELECT count(*)  FROM dba_users WHERE USERNAME='${config.schema}'`)
  if (schemaExistsResult.rows[0][0] === 0) {
    logger('Schema doesnt, exists will create schema.')
    await connection.execute(`CREATE USER ${config.schema} IDENTIFIED BY ${testPassword}`)
  }
  await connection.execute(`ALTER SESSION SET CURRENT_SCHEMA = ${config.schema} TIME_ZONE = DBTIMEZONE`)
  await connection.execute(`ALTER USER ${config.schema} quota unlimited on USERS`)

  const tableExistsResult = await connection.execute(`SELECT count(*) FROM dba_tables where table_name = '${testTable}'`)
  if (tableExistsResult.rows[0][0] === 0) {
    logger('Table doesn\'t, exists will create table.')
    await connection.execute(`CREATE TABLE ${testTable} 
      (
        ID NUMBER(19) not null,
        CREATED TIMESTAMP(3) default systimestamp not null,
        DUMMY VARCHAR2(20 char)
      )`)
  }
  const deleteResult = await connection.execute(`DELETE FROM ${testTable} WHERE 1=1`)
  logger(`Removed ${deleteResult.rowsAffected} records.`)
  const seedQuery = `INSERT INTO ${config.schema}.${testTable}
      SELECT
        rownum + 1000000 AS ID,
      SYSDATE + dbms_random.value(0, SYSDATE - SYSDATE - 365) AS CREATED,
        CASE round(dbms_random.value(1, 4))
          WHEN 1 THEN 'Basic'
          WHEN 2 THEN 'Silver'
          WHEN 3 THEN 'Gold'
          WHEN 4 THEN 'Premium'
        END AS DUMMY
      from dual
      connect by rownum <=  ${numberOfRows}`
  const insertResult = await connection.execute(seedQuery)
  logger(`Created ${insertResult.rowsAffected} records.`)
}