const oracledb = require('oracledb')
const config = require('./config')[0]

const testStream = async function (config) {
  const connection = await oracledb.getConnection(config.oraOptions)
  await connection.execute(`ALTER SESSION SET CURRENT_SCHEMA = ${config.schema} TIME_ZONE = DBTIMEZONE`)
  const params = { UPDATED_TIME: new Date('2018-01-01') }
  params.UPDATED_TIME = params.UPDATED_TIME.toISOString().replace('Z', '-00:00')
  const stream = connection.queryStream(config.queryString, params)
  stream.on('error', function (error) {
    console.error(error.message)
  })

  stream.on('data', function (data) {
    //console.log(data)
  })

  stream.on('end', function () {
    console.log('on end')
  })

  stream.on('metadata', function (metadata) {
    console.log(metadata)
  })
}

testStream(config)
