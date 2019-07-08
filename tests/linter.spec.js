const findConfig = require('./utils/config').find
const lintConfig = require('../src/linter/lintConfig')
const lintQuery = require('../src/linter/lintQuery')
const assert = require('assert')

describe('Linter Function', function () {
  it('linter should work on test data', async () => {
    const conf = findConfig('someMeasurement', 'prod')
    const errors = lintConfig(conf)
    assert.strictEqual(errors.length, 0)
  })

  it('should split queries into logical parts', async () => {
    const testString = `SELECT PS.OPPRETTET_TID           AS TIME,
           PS.TASK_TYPE               AS TASK_TYPE,
                  COUNT(PS.ID)               AS ANTALL
                  FROM PROSESS_TASK PS
                  WHERE PS.STATUS = 'FEILET'
                    AND PS.OPPRETTET_TID > TO_TIMESTAMP_TZ(:UPDATED_TIME, 'YYYY-MM-DD"T"HH24:MI:SS.FF3TZR')
                    GROUP BY PS.OPPRETTET_TID,
                             PS.TASK_TYPE
                             `
    const errorsTest1 = lintQuery(testString, ['TIME'])
    assert.strictEqual(errorsTest1.length, 0)

    const errorsTest2 = lintQuery(testString, ['TIME', 'TASK_TYPE_X'])
    assert.strictEqual(errorsTest2.length, 1)
  })
})
