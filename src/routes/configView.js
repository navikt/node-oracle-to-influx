const baseurl = require('../utils/baseurl')
const findConfig = require('../utils/config').find
const browseLinks = require('../utils/browseLinks')

module.exports = function configView (req, res) {
  const conf = findConfig(req.params.measurementName, req.params.environment)
  if (conf) {
    conf.queryString = conf.queryString.replace(/\s+/g, ' ').trim()
    conf.oraOptions.password = '**secret**'
    conf.influx.password = '**secret**'
    res.json({
      links: browseLinks(baseurl(req), conf),
      config: conf,
    })
  } else {
    res.status(404).json({
      status: 'Not found',
    })
  }
}
