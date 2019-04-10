const createClient = require('./createClient')
const NodeCache = require('node-cache')
const cache = new NodeCache({ stdTTL: 360 })
const async = require('async')
const makeCacheKey = require('../utils/makeCacheKey')
const logger = require('../utils/Logger')

module.exports = function (queryConfig, funcToExecuteIfExists) {
  const cacheKey = makeCacheKey(queryConfig.influx)
  const influx = createClient(queryConfig)
  async.waterfall([
    function (asyncCb) {
      cache.get(cacheKey, function (err, cachedValue) {
        if (cachedValue !== undefined) {
          err = true // breaking iteration.
        }
        asyncCb(err)
      })
    },

    function (asyncCb) {
      influx.ping(3000).then(hosts => {
        let err = null
        if (hosts[0].online === false) {
          err = new Error(`${hosts[0].url.href} is offline.`)
        }
        asyncCb(err)
      }).catch(err => {
        asyncCb(err)
      })
    },

    function (asyncCb) {
      influx.getDatabaseNames().then(names => {
        if (!names.includes(queryConfig.influx.database)) {
          logger.info(`Creating influx database ${queryConfig.influx.database}.`, {
            event: 'DATABASE_CREATED',
            operation: 'influx/ensure-db-exists',
          })
          return influx.createDatabase(queryConfig.influx.database)
        } else {
          return Promise.resolve()
        }
      }).then(() => {
        cache.set(cacheKey, true)
        asyncCb(null, true)
      }).catch(err => {
        asyncCb(err)
      })
    },
  ], function (err) {
    if (err && err !== true) {
      logger.error(err.message)
      funcToExecuteIfExists(err)
    } else {
      funcToExecuteIfExists()
    }
  })
}
