const md5 = require('./utils/md5')
const constants = require('./constants')
const defaults = require('./defaults')

/**
 * @param rawConfigs[]
 * @returns config[]
 */
module.exports = function (rawConfigs) {
  rawConfigs.forEach(conf => {
    conf.queryChecksum = md5(conf.queryString)
    conf.schedule = conf.schedule || defaults.schedule
    conf.environment = conf.environment || defaults.environment
    conf.snapshotMode = conf.snapshotMode || defaults.snapshotMode
    conf.oraQueryParams = conf.oraQueryParams || defaults.oraQueryParams
    conf.queryString = conf.queryString.trim()
    conf.tags = conf.tags || []
    conf.tags.push(constants.QUERY_CHECKSUM_FIELD_NAME)
    conf.tags.push(constants.ENVIRONMENT)
    conf.numberOfFails = 0
    conf.lastFailed = null
  })
  return rawConfigs
}
