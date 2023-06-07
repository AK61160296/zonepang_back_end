import Arena from "bull-arena";
import { Queue,FlowProducer } from "bullmq";
import { redisConfig } from "./redisConfig.js";

console.log(redisConfig);

const arenaConfig = Arena({
    BullMQ: Queue,
    FlowBullMQ: FlowProducer,
    queues: [
        {
            type: "bullmq",
            name: "TEST-Q",
            hostId: "zonepangHost",
            redis: redisConfig,
        },
    ],
},{
    basePath: "/"
});

export {arenaConfig}