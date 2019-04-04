const md5 = require('./utils/md5')
const constants = require('./constants')
const defaults = require('./defaults')

/**
 * @param queryConfigs[]
 * @returns config[]
 */
module.exports = function (queryConfigs) {
  queryConfigs.forEach(conf => {
    conf.queryChecksum = md5(conf.queryString)
    conf.schedule = conf.schedule || defaults.schedule
    conf.environment = conf.environment || defaults.environment
    conf.snapshotMode = conf.snapshotMode || defaults.snapshotMode
    conf.oraQueryParams = conf.oraQueryParams || defaults.oraQueryParams
    conf.tags = conf.tags || []
    conf.tags.push(constants.QUERY_CHECKSUM_FIELD_NAME)
    conf.tags.push(constants.ENVIRONMENT)
  })
  return queryConfigs
}
