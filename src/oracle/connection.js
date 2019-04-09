const oracledb = require('oracledb')
const NodeCache = require('node-cache')
const cache = new NodeCache({ stdTTL: 60 })
const logger = require('../utils/Logger')
const makeCacheKey = require('../utils/makeCacheKey')
const async = require('async')

function doRelease (connection) {
  connection.close(function (err) {
    if (err) {
      logger.error(`Error on doRelease: ${err.message}`)
    }
  })
}

module.exports = function (conf, functionCallback) {
  oracledb.extendedMetaData = true
  oracledb.maxRows = conf.maxRows || 20000
  const oraOptions = conf.oraOptions
  const sql = conf.queryString
  const params = conf.oraQueryParams || {}
  const cacheKey = makeCacheKey(oraOptions, sql, params)
  const startTime = new Date()
  const startMemory = process.memoryUsage().heapUsed
  let connection
  let prevResult = {
    metaData: [],
    rows: [],
    error: false,
  }
  async.waterfall([
    function (asyncCb) {
      cache.get(cacheKey, function (err, cachedValue) {
        if (cachedValue !== undefined) {
          cachedValue.resultFromCache = true
          err = true // breaking itteration.
        }
        asyncCb(err, cachedValue)
      })
    },

    function (cachedValue, asyncCb) {
      oracledb.getConnection(oraOptions, function (err, c) {
        connection = c
        if (err) {
          logger.error(`Error connecting to ${oraOptions.connectString} : ${err.message}`)
          prevResult.error = err.message
        }
        asyncCb(err, prevResult)
      })
    },

    function (prevResult, asyncCb) {
      if (conf.schema) {
        connection.execute(`ALTER SESSION SET CURRENT_SCHEMA = ${conf.schema} TIME_ZONE = DBTIMEZONE`, function (err) {
          asyncCb(err, prevResult)
        })
      } else {
        asyncCb(null, prevResult)
      }
    },

    function (prevResult, asyncCb) {
      connection.execute(sql, params, function (err, result) {
        if (err) {
          logger.error(`Error executing query on ${oraOptions.connectString} : ${err.message}`)
          result = prevResult
          result.error = err.message
        } else {
          result.error = false
        }
        result.rows.forEach(function (row, rowIndex) {
          let newRow = {}
          result.metaData.forEach(function (meta, metaIndex) {
            newRow[meta.name] = row[metaIndex]
          })
          result.rows[rowIndex] = newRow
        })
        result.timestamp = (new Date()).toISOString()
        result.cacheKey = cacheKey
        result.resultFromCache = false
        result.queryTimeMs = new Date() - startTime
        result.memoryUsage = process.memoryUsage().heapUsed - startMemory
        result.sql = sql.replace(/\s+/g, ' ').trim()
        result.params = params
        // logger.debug(`Query for ${conf.measurementName} done.`, [result.memoryUsage, result.queryTimeMs])
        const dynamicCacheTtl = (result.queryTimeMs / 2) < 600 ? (result.queryTimeMs / 2) : 600
        if (result.rows.length < oracledb.maxRows) {
          /**
           * We dont want to cache the maxRow-results
           */
          cache.set(cacheKey, result, dynamicCacheTtl)
        }
        doRelease(connection)
        asyncCb(err, result)
      })
    },
  ], function (err, result) {
    functionCallback(result)
  })
}
