const logger = require('../utils/Logger')

module.exports = async function (influx, database) {
  const hosts = await influx.ping(3000)
  if (hosts[0].online === false) {
    throw new Error(`${hosts[0].url.href} is offline.`)
  }
  const databaseNames = await influx.getDatabaseNames()
  if (!databaseNames.includes(database)) {
    await influx.createDatabase(database)
    logger.info(`Creating influx database ${database}.`, {
      event: 'DATABASE_CREATED',
      operation: 'influx/ensure-db-exists',
    })
  }
}
