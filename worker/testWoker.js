// import { Queue, Worker } from "bullmq";
// import { redisConfig } from "../config/redisConfig.js";
// import { Sequelize, Op } from "sequelize";

// async function testWorker(job) {
//   try {
//     const { _id } = job.data;
//     await sleep(10000);
//     console.log("success", _id);
//     return;
//   } catch (error) {
//     console.log("error");
//   }
// }
// function sleep(ms) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }
// const worker = new Worker("TEST-Q", testWorker, {
//   connection: redisConfig,
//   concurrency: parseInt(process.env.TEST_CONCURRENCY),
// });

// worker.on("completed", (job) => {
//   console.info(`${job.id} has completed!`);
// });

// worker.on("failed", (job, err) => {
//   console.error(`${job.id} has failed with ${err.message}`);
// });
