const oracleStream = require('../src/oracle/stream')
const findConfig = require('./utils/config').find
const createInfluxClient = require('../src/influx/createClient')
const ensureDatabase = require('../src/influx/ensureDatabase')
const logger = require('./logger')

async function testStreaming (conf) {
  conf.oraQueryParams = { UPDATED_TIME: new Date('2018-01-01') }
  let influx = createInfluxClient(conf)

  /**
   * Bare slette gamle data fra influx først.
   */
  await influx.dropDatabase(conf.influx.database)

  await ensureDatabase(conf)

  await influx.dropSeries({
    measurement: m => m.name(conf.measurementName),
  })
  await oracleStream(conf, (points) => {
    logger(`Flushed ${points.length} points to influx`)
    return influx.writePoints(points)
  })
}

const conf = findConfig('someMeasurement', 'prod')

testStreaming(conf)
