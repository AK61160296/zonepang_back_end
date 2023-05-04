import express from "express";
import http from "http";
import { connectDb, mongoose } from "./config/database.js";
import { addMessages } from './controller/chatsController.js';
import bodyParser from "body-parser";
import cors from "cors";
import {
  groupsRouter,
  postsRouter,
  userRouter,
  createCommentsRouter,
  feedRouter,
  notificationRouter,
  createPostsRouter,
  createChatsRouter,
  chatsRouter,
  reportsRouter
} from "./routes/index.js";
import apiKeyMiddleware from "./middleware/apikey.js";
import * as dotenv from "dotenv";
import { Server } from "socket.io";
import { zpConversationsModel, zpMessagesModel } from './models/index.js';
//Declaration Variables Section
const app = express();
const server = http.createServer(app);
const io = new Server(server);
dotenv.config();

//Use Library Section
app.use(express.json({ limit: "10mb" }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:3000/",
//     methods: ["GET", "POST"],
//   }
// });

app.get("/", (req, res) => {
  res.send("API Facebook Send");
});

app.use("/api", apiKeyMiddleware, createCommentsRouter);
app.use("/api", apiKeyMiddleware, createPostsRouter);
app.use("/api", apiKeyMiddleware, createChatsRouter);
app.use("/api", apiKeyMiddleware, groupsRouter);
app.use("/api", apiKeyMiddleware, postsRouter);
app.use("/api", apiKeyMiddleware, userRouter);
app.use("/api", apiKeyMiddleware, feedRouter);
app.use("/api", apiKeyMiddleware, notificationRouter);
app.use("/api", apiKeyMiddleware, chatsRouter);
app.use("/api", apiKeyMiddleware, reportsRouter);

const onlineUsers = new Map();

io.on('connection', (socket) => {
  socket.on("add-user", (userId) => {
    console.log("userId", userId)
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    console.log("sendUserSocket",sendUserSocket)
    console.log("onlineUsers",onlineUsers)
    if (sendUserSocket) {

      socket.to(sendUserSocket).emit("msg-recieve", data);
    }
  });
});

app.use(function (req, res, next) {
  res.io = io;
  next();
});

const port = process.env.API_PORT ? process.env.API_PORT : 4000;
server.listen(port, () => {
  console.log("API Running on port : ", port);
});
