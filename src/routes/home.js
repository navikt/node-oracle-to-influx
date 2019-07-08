const pkg = require('../../package.json')
const baseurl = require('../utils/baseurl')
module.exports = function (req, res) {
  const version = req.app.get('options').version
  const baseURL = baseurl(req) + req.originalUrl
  res.json({
    name: pkg.name,
    version: version,
    dbInfo: `${baseURL}db-info`,
    configs: `${baseURL}browse`,
    itsAlive: `${baseURL}its-alive`,
  })
}
