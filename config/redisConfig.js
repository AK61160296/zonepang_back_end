import * as dotenv from 'dotenv';
dotenv.config();


const redisConfig = {
    port: 6379,
    host: process.env.REDIS_CONNECT_URL,
    password: ''
}

export {redisConfig}