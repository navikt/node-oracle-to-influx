const findConfig = require('../utils/config').find

module.exports = function (req, res) {
  const conf = findConfig(req.params.measurementName, req.params.environment)
  if (conf) {
    res.set('Content-Type', 'text/plain')
    res.send(conf.queryString)
  } else {
    res.status(404).json({
      status: 'Not found',
    })
  }
}
