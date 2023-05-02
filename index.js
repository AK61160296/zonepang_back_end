import express from "express";
import http from "http";
import { connectDb, mongoose } from "./config/database.js";
import { addMessages, getMessages } from './controller/chatsController.js';
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
  chatsRouter
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


io.on('connection', (socket) => {
  console.log('socket connected');

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on("chat-conversation", async (userId) => {
    const conversation = await zpConversationsModel.find({ $or: [{ sender_id: userId }, { receiver_id: userId }] });
    socket.emit("chat-conversation", conversation);
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
