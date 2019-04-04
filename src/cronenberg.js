const cron = require('cron')

class Cronenberg {
  constructor () {
    this.jobs = []
  }

  add (cronTime, funcToExecuteOnTick) {
    let onTick = () => {
      setTimeout(() => { funcToExecuteOnTick() }, Math.floor(Math.random() * 60000))
    }
    this.jobs.push(new cron.CronJob({
      cronTime: cronTime,
      onTick: onTick,
      start: false,
      runOnInit: false,
    }))
  }

  start () {
    this.jobs.forEach(function (job) {
      job.start()
    })
  }
}

module.exports = new Cronenberg()
