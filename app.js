const { createServer } = require("http");
const express = require("express");
const { Server } = require("socket.io");
let mongoose = require("mongoose");
let dotenv = require("dotenv");
let userRouter = require("./Routes/User");
let UserModel = require("./Schemas/Users");
let cors = require("cors");

dotenv.config();

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("database is connected!!");
  })
  .catch(() => {
    console.log("error in conection with db!!");
  });

let app = express();
app.use(express.json());
app.use(cors());

let httpserver = createServer();
let io = new Server(httpserver, {
  cors: {
    origin: "http://192.168.1.11:3000",
  },
});

// listen on the port 9000 for http
httpserver.listen(9000, () => {
  console.log("http server is listening on port 9000!!");
});

// listen on another http serrver made by aPP
app.listen(8080, () => {
  console.log("App is listeming on port 8080!!");
});

async function send_pending_messages(sock) {
  let mobile = sock.handshake.auth.mobile;
  console.log("mobile is :  ", mobile);

  if (mobile) {
    let msgs = await UserModel.findOne({ mobile: mobile }, ["pendingmsgs"]);
    await UserModel.findOneAndUpdate(
      { mobile: mobile },
      {
        pendingmsgs: [],
      }
    );
    console.log("pending_msgs are : ", msgs.pendingmsgs);
    sock.emit("pending_msgs", msgs.pendingmsgs);
  }
}

// clients connected mapping
let conn_clients = new Map();

async function sendmsgTouser(msg) {
  if (conn_clients.has(msg.receiver)) {
    let recv_socket = conn_clients.get(msg.receiver);
    recv_socket.emit("msg", msg);
  }
  // user is offline
  else {
    console.log(msg.receiver, "not connected!!!");
    await UserModel.findOneAndUpdate(
      { mobile: msg.receiver },
      {
        $push: { pendingmsgs: msg },
      }
    );
  }
}

// handle chatting of persons
io.on("connection", (socket) => {
  console.log("someone connected with id : ", socket.id);
  conn_clients.set(socket.handshake.auth.mobile, socket);
  console.log("connected clients length : ", conn_clients.size);
  console.log("keys are : ", conn_clients.keys().next());

  //  on disconnection of this client
  socket.on("disconnect", (reason) => {
    console.log(
      "socket with mobile : ",
      socket.handshake.auth.mobile,
      "disconnected for reason : ",
      reason
    );
    conn_clients.delete(socket.handshake.auth.mobile);
    console.log("connected clients length : ", conn_clients.size);
  });

  // first do this
  // send_pending_messages(socket);

  socket.on("msg", (msg) => {
    console.log("got the message!!", msg);
    sendmsgTouser(msg);
  });

  socket.on("video-offer",(offer)=>{
    console.log("we got the video offer!!");
    socket.broadcast.emit("offers",offer);
  })

  socket.on("video-answer",(video_answer)=>{
    console.log("we got the video-answer!!");
    socket.broadcast.emit("video-answer",video_answer);
  })

  socket.on("ice-candidate",(cand)=>{
    console.log("we got ice candidate!!")
    socket.broadcast.emit("ice-candidate",cand);
  })

});

// express app settings
app.use("/api/user", userRouter);
