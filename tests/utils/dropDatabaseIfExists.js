const logger = require('./logger')
module.exports = async function dropDatabaseifExists (influx, database) {
  const databases = await influx.getDatabaseNames()
  if (databases.includes(database)) {
    await influx.dropDatabase(database)
    logger(`Removed database ${database} before test`)
  }
}
