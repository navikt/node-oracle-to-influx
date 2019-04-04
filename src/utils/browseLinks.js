module.exports = function (baseURL, conf) {
  return {
    parent: `${baseURL}/browse`,
    config: `${baseURL}/browse/${conf.measurementName}/${conf.environment}`,
    influxTail: `${baseURL}/browse/${conf.measurementName}/${conf.environment}/influx-tail`,
    oracleTail: `${baseURL}/browse/${conf.measurementName}/${conf.environment}/ora-tail`,
    viewSQL: `${baseURL}/browse/${conf.measurementName}/${conf.environment}/show-sql`,
    runJob: `${baseURL}/browse/${conf.measurementName}/${conf.environment}/run-job`,
  }
}
