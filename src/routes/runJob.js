const getConfig = require('../utils/config').find
const oraToInflux = require('../oraToInflux')
const browseLinks = require('../utils/browseLinks')
const baseurl = require('../utils/baseurl')

module.exports = async function (req, res) {
  const conf = getConfig(req.params.measurementName, req.params.environment)
  if (conf) {
    const result = await oraToInflux.unshift(conf)
    res.json({
      links: browseLinks(baseurl(req), conf),
      result: result,
    })
  } else {
    res.status(404).json({
      status: 'Measurement not found',
    })
  }
}
