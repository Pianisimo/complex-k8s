const keys = require('./keys');
const redis = require('redis');

let sub;
const client = redis.createClient({
    url: keys.redisURL, // redis:// + docker-compose service name
    port: keys.redisPort, // redis default port
    retry_strategy: () => 1000
});

client.connect()
    .then(r => {
        sub = client.duplicate();
        sub.on('message', (channel, message) => {
            client.hSet('values', message, fib(parseInt(message))).then(r => {

            });
        });

        sub.subscribe('insert').then(r => {

        });
    }, reason => {
        console.log('Redis Client Error', reason)
    });

function fib(index) {
    if (index < 2) {
        return 1;
    }
    return fib(index - 2) + fib(index - 1);
}
