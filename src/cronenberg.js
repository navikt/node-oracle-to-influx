const cron = require('cron')

class Cronenberg {
  constructor () {
    this.jobs = []
  }

  add (cronTime, funcToExecuteOnTick) {
    this.jobs.push(new cron.CronJob({
      cronTime: cronTime,
      onTick: funcToExecuteOnTick,
      start: false,
      runOnInit: true,
    }))
  }

  start () {
    this.jobs.forEach(function (job) {
      job.start()
    })
  }
}

module.exports = new Cronenberg()
