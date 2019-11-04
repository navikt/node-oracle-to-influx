# node-oracle-to-influx
Node script/server that moves data to based on polling an oracle based on certain intervals.

[![npm version](http://img.shields.io/npm/v/@navikt/oracle-to-influx.svg?style=flat)](https://npmjs.org/package/@navikt/oracle-to-influx "View this project on npm")
[![CircleCi](http://img.shields.io/circleci/project/github/navikt/node-oracle-to-influx/master.svg?style=flat)](https://circleci.com/gh/navikt/node-oracle-to-influx "View this project on circleci")

### Configuration
The server will take a config which will be something like this

```javascript
export default {
    measurementName: 'someMeasurement',
    schedule: '* * * * *',
    queryString: `SELECT 
    CREATED as TIME,
       DUMMY_TAG,
       COUNT(ID) as COUNT_OF_FOO
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
      'COUNT_OF_FOO': 1,
    },
    tags: [
      'DUMMY_TAG',
    ],
    oraOptions: {
      connectString: process.env.ORA_CONNECT_STRING || 'localhost:1521/XE',
      user: process.env.ORA_USERNAME || 'username',
      password: process.env.ORA_PASSWORD || 'Pas$w0rd',
    }
  }
```
The config is as follows:

|key|desc|default|
|---|---|---|
|measurementName|A name that describes the measurement in the influx database |-|
|schedule|Cron expression to configure how often the query should be run.|-|
|queryString|A SELECT query containing at least a column named `TIME` an an injection of `:UPDATED_TIME`, as explained under.  |-|
|schema|The Oracle Database schema to fetch data from.|-|
|influx|Influx db config passed to [the InfluxDB Node.js client] |-|
|fields|Configured for influx db|-|
|tags|Configured for influx db|-|
|oraOptions|Configuration passed to [the node-oracledb add-on for Node.js] |-|

### The query
Influx db takes a timestamp as primary key along with the TAGS. This makes a row idempotent, meaning that you can run
the same query many times without getting duplicate data. Using the timestamp is a limitation, but after working with
influx-db a smart one. So if something happens on the exact same time, with the same tags the field need to be grouped.
You should read more about this here [InfluxDB key concepts].

This script uses the time column to not having to update big tables, but be able to read just whats needed. For this to
happen you need to add a line to your query where `ora-to-influx` can inject the time. The example query under explains 
this:
```sql
SELECT 
    CREATED as TIME,
       DUMMY_TAG,
       COUNT(ID) as COUNT_OF_FOO
FROM TEST_TABLE_NAME
WHERE CREATED > TO_TIMESTAMP_TZ(:UPDATED_TIME, 'YYYY-MM-DD"T"HH24:MI:SS.FF3TZR')
GROUP BY CREATED, DUMMY
```

For performance reasons, you should not set any ORDER BY in the query as its not needed. `ora-to-influx` uses 
oracle streaming and will split huge resultset into multiple queries towards influxdb. This way you could read millions
of rows from oracle without thinking about performance. At least this should work in theory.

### Creating your own service
To create your own ora-to-influx service you need to create a simple server script. Startup-scripts etc is custom as
this might vary from network to network. The server could be created as simple as:

1. create a folder and go into it
2. Run `npm init && npm install @navikt/oracle-to-influx`
3. Add a `server.js` file
4. Add an dockerimage extending for instance `FROM pipekung/node-oracle:latest` or another dockerimage with instant
client installed. See this repository for a setup.
5. Create a folder or a file called to your config. This should be included as a javascript file and passed to the 
bootstrap function. The config should be wrapped in an array, as you probably would like to run multiple scripts.

Example server.js
```js
const rawConfig = require('./config')
const bootstrap = require('@navikt/oracle-to-influx').bootstrap
const port = process.env.PORT || 8081
const options = {}
bootstrap(rawConfig, options).listen(port)
```


### Service endpoints
The service is stateless, meaning that there is no changes to the service after its deployed. All changes is done to
your repo and deployed. This way all your changes will be version controlled. Anyway there are some usefull endpoints
that you can use to debug the service:

|Route|Description|default|
|---|---|---|
|`/browse`|See queries defined|
|`/browse/:measurementName/:environment`| See the config for that query in a certain environment|
|`/browse/:measurementName/:environment/influx-tail`|What data is latest pushed to influx|
|`/browse/:measurementName/:environment/run-job`|Run the job...|
|`/browse/:measurementName/:environment/show-sql`|Show the raw SQL defined.|
|`/db-info`|Get information about the databases configured|
|`/its-alive`|Health endpoint.|

### For local package development
Not explained into detail, just here for personal reference
* `yarn link "@navikt/oracle-to-influx"`
and
* `yarn add @navikt/oracle-to-influx`



[the InfluxDB Node.js client]: https://www.npmjs.com/package/influxdb-nodejs#write-point
[the node-oracledb add-on for Node.js]: https://www.npmjs.com/package/oracledb
[InfluxDB key concepts]: https://docs.influxdata.com/influxdb/v1.7/concepts/key_concepts/
