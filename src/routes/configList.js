const getConfig = require('../utils/config').get
const baseurl = require('../utils/baseurl')
const browseLinks = require('../utils/browseLinks')

function sortObject (o) {
  return Object.keys(o).sort().reduce((r, k) => (r[k] = o[k], r), {})
}

module.exports = function (req, res) {
  const baseURL = baseurl(req)
  const resObj = {}

  getConfig().forEach(function (conf) {
    const links = browseLinks(baseURL, conf)
    resObj[`${conf.measurementName}-${conf.environment}`] = links.config
  })
  res.json(sortObject(resObj))
}
