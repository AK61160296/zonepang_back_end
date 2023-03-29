import { createClient } from 'redis';

const clientRedis = createClient({
    url: `redis://${process.env.REDIS_CONNECT_URL}:6379`
});

clientRedis.on('error', err => console.log('Redis Client Error', err));

clientRedis.connect();

export {clientRedis}