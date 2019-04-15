const pkg = require('../../package.json')
const baseurl = require('../utils/baseurl')
module.exports = function (req, res) {
  const baseURL = baseurl(req) + req.originalUrl
  res.json({
    name: pkg.name,
    version: pkg.version,
    dbInfo: `${baseURL}db-info`,
    configs: `${baseURL}browse`,
    itsAlive: `${baseURL}its-alive`,
  })
}
