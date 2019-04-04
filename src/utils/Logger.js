class Logger {
  constructor () {
    // no lint
  }

  log (level, message, params) {
    const logEntry = { message, level }
    logEntry.environment = process.env.FASIT_ENVIRONMENT_NAME
    if (typeof params === 'object') {
      Object.keys(params).forEach(function (paramName) {
        logEntry[paramName] = params[paramName]
      })
    }
    if (!logEntry.level) {
      logEntry.level = 'DEBUG'
    }
    const logwith = logEntry.level.toLowerCase()
    console[logwith](JSON.stringify(logEntry))
  }

  debug (message, params) {
    this.log('DEBUG', message, params)
  }

  info (message, params) {
    this.log('INFO', message, params)
  }

  error (message, params) {
    this.log('ERROR', message, params)
  }
}

module.exports = new Logger()
