//Import Section List
import express from "express";
import http from "http";
import { connectDb, mongoose } from "./config/database.js";
import bodyParser from "body-parser";
import cors from "cors";
import {
  groupsRouter,
  postsRouter,
  userRouter,
  createCommentsRouter,
  feedRouter,
  notificationRouter,
  createPostsRouter
} from "./routes/index.js";
import apiKeyMiddleware from "./middleware/apikey.js";
import * as dotenv from "dotenv";
//Declaration Variables Section
const app = express();
const server = http.createServer(app);
//Dot ENV Configuration
dotenv.config();

//Use Library Section
app.use(express.json({ limit: "10mb" }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.get("/", (req, res) => {
  res.send("API Facebook Send");
});

app.use("/api", apiKeyMiddleware, createCommentsRouter);
app.use("/api", apiKeyMiddleware, createPostsRouter);
app.use("/api", apiKeyMiddleware, groupsRouter);
app.use("/api", apiKeyMiddleware, postsRouter);
app.use("/api", apiKeyMiddleware, userRouter);
app.use("/api", apiKeyMiddleware, feedRouter);
app.use("/api", apiKeyMiddleware, notificationRouter);


const port = process.env.API_PORT ? process.env.API_PORT : 4000;
server.listen(port, () => {
  console.log("API Running on port : ", port);
});
