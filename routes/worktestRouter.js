import path from "path";
import express from "express";
import multer from "multer";
import AWS from "aws-sdk";
import multerS3 from "multer-s3";
const worktestRouter = express.Router();
import { Queue } from "bullmq";
import { redisConfig } from "../config/redisConfig.js";
const queue = new Queue("TEST-Q", { connection: redisConfig });

worktestRouter.post("/addQ", async function (req, res) {
  try {
    const q_code_time = Math.floor(Date.now() / 1000);
    await queue.add(
      `testWorker${q_code_time}`,
      {
        _id: "AddQ1",
      },
      {
        removeOnComplete: false,
      }
    );
    res.json("test");
  } catch (error) {
    console.log(error);
  }
});
export { worktestRouter };
