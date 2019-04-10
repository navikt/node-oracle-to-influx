const createClient = require('./createClient')
const logger = require('../utils/Logger')

module.exports = async function (queryConfig) {
  const influx = createClient(queryConfig)
  const hosts = await influx.ping(3000)
  if (hosts[0].online === false) {
    throw new Error(`${hosts[0].url.href} is offline.`)
  }
  const databaseNames = await influx.getDatabaseNames()
  if (!databaseNames.includes(queryConfig.influx.database)) {
    await influx.createDatabase(queryConfig.influx.database)
    logger.info(`Creating influx database ${queryConfig.influx.database}.`, {
      event: 'DATABASE_CREATED',
      operation: 'influx/ensure-db-exists',
    })
  }
}
