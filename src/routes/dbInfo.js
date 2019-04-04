const multiQuery = require('../oracle/multiQuery')
const getConfig = require('../utils/config').get
const async = require('async')
const md5 = require('../utils/md5')

module.exports = function (req, res) {
  const connections = {}
  getConfig().forEach(conf => {
    const key = md5(JSON.stringify(conf.oraOptions))
    connections[key] = conf.oraOptions
  })

  const queries = [
    'SELECT sys_context(\'USERENV\',\'CURRENT_SCHEMA\') as db_user, dbtimezone, SESSIONTIMEZONE  from dual',
  ]
  const statuses = []
  // Feil på async... uviktig funksjonalitet.
  async.each(connections, function (oraOptions, asynCb) {
    multiQuery(oraOptions, queries, function (result) {
      result.connectionOk = Object.keys(result).length !== 0
      result.connectString = oraOptions.connectString
      result.user = oraOptions.user
      result.password = '**secret**'
      statuses.push(result)
      asynCb()
    })
  }, function (err) {
    if (err) {
      res.json(err)
    } else {
      res.json(statuses)
    }
  })
}
