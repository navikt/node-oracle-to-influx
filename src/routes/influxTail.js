const influxTail = require('../influx/influxTail')
const findConf = require('../utils/config').find
const logger = require('../utils/Logger')
const browseLinks = require('../utils/browseLinks')
const baseurl = require('../utils/baseurl')

module.exports = function (req, res) {
  const conf = findConf(req.params.measurementName, req.params.environment)
  if(conf){
    influxTail(conf).then(function (result) {
      res.json({
        links: browseLinks(baseurl(req), conf),
        data: result,
      })
    }).catch(err => {
      logger.error(`influxTail failed with error, ${err.message}`)
    })
  } else {
    res.status(404).json({
      status: 'Not found',
    })
  }
}
