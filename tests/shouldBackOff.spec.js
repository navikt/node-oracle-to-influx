const assert = require('assert')
const shouldBackOff = require('../src/utils/shouldBackOff')

describe('ShouldBackOff', function () {
  it('should back off', async () => {
    const t = 1591197908902
    assert.strictEqual(shouldBackOff(0, t, t), false)
    assert.strictEqual(shouldBackOff(0, t, t + 1000 * 30), false)
    assert.strictEqual(shouldBackOff(30, t, t + 1000 * 30), true)
    assert.strictEqual(shouldBackOff(1, t, t + 1000 * 60 * 60), false)
  })
  it('should run atleast once a day', async () => {
    const t = 1591197908902
    const aDay = 86400000
    assert.strictEqual(shouldBackOff(3000, t, t + aDay + 1), false)
  })
})
