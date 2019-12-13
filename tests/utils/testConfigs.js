module.exports = [
  {
    measurementName: 'someMeasurement',
    schedule: '* * * * *',
    queryString: `SELECT 
    CREATED as TIME,
       DUMMY,
       COUNT(ID) as ANTALL
FROM TEST_TABLE_NAME
WHERE CREATED > TO_TIMESTAMP_TZ(:UPDATED_TIME, 'YYYY-MM-DD"T"HH24:MI:SS.FF3TZR')
GROUP BY CREATED, DUMMY
    `,
    schema: 'TEST_NODE_ORACLE_TO_INFLUX',
    influx: {
      url: process.env.INFLUX_URL || 'http://localhost:8086',
      database: 'metrics',
      username: 'admin',
      password: '',
    },
    fields: {
      ANTALL: 1,
    },
    tags: [
      'DUMMY',
    ],
    oraOptions: {
      connectString: process.env.ORA_CONNECT_STRING || 'localhost:1521/xe',
      user: 'system',
      password: 'oracle',
    },
  },
]
