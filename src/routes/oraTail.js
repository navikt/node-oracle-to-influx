const oraConnect = require('../oracle/connection')
const findConfig = require('../utils/config').find
const createDate = require('../utils/createDate')
const browseLinks = require('../utils/browseLinks')
const baseurl = require('../utils/baseurl')

/**
 * Henter bare data de siste 7 dager og max 1000 rader.
 * @param req
 * @param res
 */
module.exports = function (req, res) {
  const conf = findConfig(req.params.measurementName, req.params.environment)
  if (conf) {
    if (!conf.snapshotMode) {
      let UPDATED_TIME = createDate(new Date(), -7)
      UPDATED_TIME.setMinutes(0)
      UPDATED_TIME.setHours(0)
      UPDATED_TIME.setMilliseconds(0)
      UPDATED_TIME.setSeconds(0)
      conf.oraQueryParams.UPDATED_TIME = UPDATED_TIME
    }
    if (!conf.queryString.match(/order by/i)) {
      conf.queryString = `${conf.queryString} ORDER BY TIME `
    }
    conf.queryString = `${conf.queryString} DESC`
    conf.maxRows = 1000
    oraConnect(conf,
      function (result) {
        res.json({
          links: browseLinks(baseurl(req), conf),
          data: result,
        })
      })
  } else {
    res.status(404).json({
      status: 'Not found',
    })
  }
}
