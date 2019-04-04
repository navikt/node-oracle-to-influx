const getConfig = require('../utils/config').find
const oraToInflux = require('../oraToInflux')
const browseLinks = require('../utils/browseLinks')
const baseurl = require('../utils/baseurl')

module.exports = function (req, res) {
  const conf = getConfig(req.params.measurementName, req.params.environment)
  if (conf) {
    oraToInflux.unshift(conf, function (result) {
      res.json({
        links: browseLinks(baseurl(req), conf),
        result: result,
      })
    })
  } else {
    res.status(404).json({
      status: 'Not found',
    })
  }
}
