const oracledb = require('oracledb')
const findConfig = require('./config').find

oracledb.autoCommit = true

const config = findConfig('someMeasurement', 'prod')

async function waitOnOracle (oraOptions) {
  const connection = await oracledb.getConnection(oraOptions)
  const result = await connection.execute(`SELECT sys_context('USERENV','CURRENT_SCHEMA') as db_user, dbtimezone, SESSIONTIMEZONE  from dual`)
  console.log('connected to oracledatabase ', result.rows[0])
}

waitOnOracle(config.oraOptions)


