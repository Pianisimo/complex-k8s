module.exports = {
    redisURL: process.env.REDIS_URL,
    redisPort: process.env.REDIS_PORT,
    pgUser: process.env.PGUSER,
    pgHost: process.env.PGHOST,
    pgDatabase: process.env.PGDATABASE,
    pgPassword: process.env.PGPASSWORD,
    pgPort: process.env.PGPORT,
}


module.exports = {
    redisURL: 'redis://localhost',
    redisPort: 6379,
    pgUser: 'postgres',
    pgHost: 'localhost',
    pgDatabase: 'postgres',
    pgPassword: 'POSTGRES_PASSWORD',
    pgPort: 5432,
}
