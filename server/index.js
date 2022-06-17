const keys = require('./keys');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

//region Postgres Setup
const {Pool} = require('pg');

const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort
});

pgClient.on('error', () => console.log('Lost connection to pg'));

pgClient
    .query('CREATE TABLE IF NOT EXISTS values (number INT)')
    .catch(err => console.log(err));
//endregion

//region Redis Setup
const redis = require('redis')
let redisSubscriber;

const redisClient = redis.createClient({
    url: keys.redisURL, // redis:// + docker-compose service name
    port: keys.redisPort, // redis default port
    retry_strategy: () => 1000
});

redisClient.connect()
    .then(r => {
        redisSubscriber = redisClient.duplicate();
        redisSubscriber.connect()
            .then(value => {
                redisSubscriber.subscribe('indexes').then(r => {
                    console.log("redisSubscriber listeneed");
                    console.log(r)
                });
            });
    }, reason => {
        console.log('Redis Client Error', reason);
    });

function fib(index) {
    if (index < 2) {
        return 1;
    }
    return fib(index - 2) + fib(index - 1);
}
//endregion

//region Routes
app.get('/', (req, res) => {
    res.send('Hi');
});

app.get('/values/all', async (req, res) => {
    const values = await pgClient.query('SELECT * from values');
    res.send(values.rows);
});

app.get('/values/current', async (req, res) => {
    console.log('calling values/current');
    const keys = await redisClient.keys('indexes', () => {});
    res.send(keys);
});

app.post('/values', async (req, res) => {
    const index = req.body.index;
    if (parseInt(index) > 40) {
        return res.status(422).send('Index too high');
    }

    await redisClient.hSet('indexes', index, 'Nothing yet');
    await redisClient.publish('indexes', index);
    await pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);
    res.send({working: true});
});

app.listen(5001, err => {
    console.log('Server listening in 5001...');
})
//endregion
