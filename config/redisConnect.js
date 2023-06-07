import { createClient } from 'redis';
import * as dotenv from 'dotenv';
dotenv.config();

const clientRedis = createClient({
    url: `redis://${process.env.REDIS_CONNECT_URL}:6379`
});

clientRedis.on('error', err => console.log('Redis Client Error', err));
clientRedis.on('connect', () => {
    console.log('Connected to Redis Server');
});
clientRedis.connect();
export {clientRedis}