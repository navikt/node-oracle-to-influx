const async = require('async')
const oraConnect = require('./connection')

const multiQuery = function (oraOptions, queries, cb) {
  const allMetrics = {}
  async.eachSeries(queries, function (queryString, callback) {
    const connectOptions = {
      oraOptions,
      queryString,
    }
    oraConnect(connectOptions, function (result) {
      result.metaData.forEach(function (meta, index) {
        const metricName = meta.name.toLowerCase()
        allMetrics[metricName] = result.rows[0][meta.name]
      })
      callback()
    })
  }, function (err) {
    cb(allMetrics)
  })
}

module.exports = multiQuery
