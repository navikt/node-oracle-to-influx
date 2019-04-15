const createInfluxClient = require('./createClient')
const constants = require('../constants')

module.exports = async function (influx, conf) {
  await influx.dropSeries({
    measurement: m => m.name(conf.measurementName),
    where: e => {
      if (conf.snapshotMode) {
        return e
          .tag(constants.ENVIRONMENT).equals.value(conf.environment)
      } else {
        return e
          .tag(constants.ENVIRONMENT).equals.value(conf.environment).and
          .tag(constants.QUERY_CHECKSUM_FIELD_NAME).notEqual.value(conf.queryChecksum)
      }
    },
  })
}
