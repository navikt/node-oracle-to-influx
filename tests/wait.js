const oracledb = require('oracledb')
const findConfig = require('./config').find

oracledb.autoCommit = true

const config = findConfig('someMeasurement', 'prod')

function sleep (millis) {
  return new Promise(resolve => setTimeout(resolve, millis))
}

async function waitOnOracle (oraOptions, attempt, message) {
  try {
    const connection = await oracledb.getConnection(oraOptions)
    const result = await connection.execute(`SELECT sys_context('USERENV','CURRENT_SCHEMA') as db_user, dbtimezone, SESSIONTIMEZONE  from dual`)
    console.info('Success, connected to oracledatabase ', result.rows[0])
  } catch (e) {
    // 2 minutter bør holde for å komme seg på.
    if (attempt < 120) {
      if (message !== e.message) {
        console.log('Trying to connect: ', e.message)
      }
      attempt++
      await sleep(1000)
      return waitOnOracle(oraOptions, attempt, e.message)
    } else {
      console.error('Failed connecting to oracle exiting.')
      process.exit(1)
    }
  }
}

waitOnOracle(config.oraOptions, 1)
