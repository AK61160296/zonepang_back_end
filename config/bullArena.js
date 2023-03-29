import Arena from "bull-arena";
import { Queue } from "bullmq";
import { redisConfig } from "./redisConfig.js";

console.log(redisConfig);

const arenaConfig = Arena({
    BullMQ: Queue,
    queues: [
        {
            type: "bullmq",
            name: "get-token-worker",
            hostId: "BoardPangHost",
            redis: redisConfig,
        },
        {
            type: "bullmq",
            name: "facebook-worker",
            hostId: "BoardPangHost",
            redis: redisConfig,
        },
        {
            type: "bullmq",
            name: "get-all-user-on-page",
            hostId: "BoardPangHost",
            redis: redisConfig,
        },
        {
            type: "bullmq",
            name: "lineOA-worker",
            hostId: "BoardPangHost",
            redis: redisConfig,
        }
    ],
},{
    basePath: "/"
});

export {arenaConfig}