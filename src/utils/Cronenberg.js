const cron = require('cron')

class Cronenberg {
  constructor () {
    this.jobs = []
  }

  add (cronTime, funcToExecuteOnTick) {
    const job = new cron.CronJob({
      cronTime: cronTime,
      onTick: funcToExecuteOnTick,
      start: false,
      runOnInit: true,
    })
    this.jobs.push(job)
    return job
  }

  start () {
    this.jobs.forEach(function (job) {
      job.start()
    })
  }
}

module.exports = new Cronenberg()
