const findConfig = require('./utils/config').find
const createInfluxClient = require('../src/influx/createClient')
const dropDatabaseIfExists = require('./utils/dropDatabaseIfExists')

async function reset (conf) {
  conf.oraQueryParams = { UPDATED_TIME: new Date('2018-01-01') }
  const influx = createInfluxClient(conf)
  await dropDatabaseIfExists(influx, conf.influx.database)
}

const conf = findConfig('someMeasurement', 'prod')
reset(conf)
