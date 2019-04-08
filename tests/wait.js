const oracledb = require('oracledb')
const findConfig = require('./config').find

oracledb.autoCommit = true

const config = findConfig('someMeasurement', 'prod')

function sleep (millis) {
  return new Promise(resolve => setTimeout(resolve, millis))
}

async function waitOnOracle (oraOptions, attempt) {
  try {
    const connection = await oracledb.getConnection(oraOptions)
    const result = await connection.execute(`SELECT sys_context('USERENV','CURRENT_SCHEMA') as db_user, dbtimezone, SESSIONTIMEZONE  from dual`)
    console.info('connected to oracledatabase ', result.rows[0])
  } catch (e) {
    if (attempt < 20) {
      console.log(e.message)
      attempt++
      await sleep(1000)
      return waitOnOracle(oraOptions, attempt)
    } else {
      console.error('Failed connecting to oracle exiting.')
      process.exit(1)
    }
  }
}

waitOnOracle(config.oraOptions, 1)
