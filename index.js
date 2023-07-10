import express from "express";
import http from "http";
import { connectDb, mongoose } from "./config/database.js";
import { addMessages } from "./controller/chatsController.js";
import bodyParser from "body-parser";
// import { arenaConfig } from "./config/bullArena.js";
import cors from "cors";
import {
  groupsRouter,
  postsRouter,
  userRouter,
  createCommentsRouter,
  searchRouter,
  notificationRouter,
  createPostsRouter,
  createChatsRouter,
  chatsRouter,
  reportsRouter,
  authRouter,
  appFreeRouter,
  userEditProfileRouter,
  shortRouter,
  productRouter,
  paymentRouter,
  createSlipRouter,
  testRouter,
  worktestRouter,
} from "./routes/index.js";
import apiKeyMiddleware from "./middleware/apikey.js";
import * as dotenv from "dotenv";
import { Server } from "socket.io";
import job from "./cronJob/testCronJob.js";
// import { clientRedis } from "./config/redisConnect.js";
const app = express();
const server = http.createServer(app);
const io = new Server(server);
dotenv.config();

//Use Library Section
app.use(express.json({ limit: "10mb" }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.get("/", (req, res) => {
  res.send("API");
});

app.use("/api", apiKeyMiddleware, createCommentsRouter);
app.use("/api", apiKeyMiddleware, createPostsRouter);
app.use("/api", apiKeyMiddleware, createChatsRouter);
app.use("/api", apiKeyMiddleware, createSlipRouter);
app.use("/api", apiKeyMiddleware, userEditProfileRouter);
app.use("/api", apiKeyMiddleware, groupsRouter);
app.use("/api", apiKeyMiddleware, postsRouter);
app.use("/api", apiKeyMiddleware, userRouter);
app.use("/api", apiKeyMiddleware, searchRouter);
app.use("/api", apiKeyMiddleware, notificationRouter);
app.use("/api", apiKeyMiddleware, chatsRouter);
app.use("/api", apiKeyMiddleware, reportsRouter);
app.use("/api", apiKeyMiddleware, authRouter);
app.use("/api", apiKeyMiddleware, appFreeRouter);
app.use("/api", apiKeyMiddleware, productRouter);
app.use("/api", apiKeyMiddleware, paymentRouter);
app.use("/api", apiKeyMiddleware, testRouter); /////////
app.use("/api", apiKeyMiddleware, worktestRouter);

// app.use("/arena", arenaConfig);
app.use(shortRouter);

const onlineUsers = new Map();
global.onlineUsersInChat = new Map();
global.onlineUsersSystem = new Map();

io.on("connection", (socket) => {
  socket.on("add-user", (userId) => {
    console.log("add-userId", userId);
    onlineUsers.set(userId, socket.id);
  });

  socket.on("add-user-chat", (userId) => {
    onlineUsersInChat.set(userId, socket.id);
  });

  socket.on("add-user-online", (userId) => {
    console.log("userId-online", userId);
    onlineUsersSystem.set(userId, socket.id);
    console.log("onlineUsersSystem", onlineUsersSystem);
  });

  socket.on("delete-user-chat", (userId) => {
    console.log("delete-user-chat", userId);
    onlineUsersInChat.delete(userId);
  });
  socket.on("delete-user-online", (userId) => {
    onlineUsersSystem.delete(userId);
    console.log("onlineUsersSystem", onlineUsersSystem);
  });

  socket.on("send-msg", async (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    const sendUserSystem = onlineUsersSystem.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data);
    }
    if (sendUserSystem) {
      socket.to(sendUserSystem).emit("msg-new", data);
    }
  });
});

app.use(function (req, res, next) {
  res.io = io;
  // job.start();
  next();
});

const port = process.env.API_PORT ? process.env.API_PORT : 4000;
server.listen(port, () => {
  console.log("API Running on port : ", port);
});
