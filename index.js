//Import Section List
import express from "express";
import http from "http";
import { connectDb } from "./config/database.js";
import bodyParser from "body-parser";
import cors from "cors";
import {
  groupsRouter,
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

app.use("/api/group", apiKeyMiddleware, groupsRouter);


const port = process.env.API_PORT ? process.env.API_PORT : 3000;
server.listen(port, () => {
  console.log("API Running on port : ", port);
});
