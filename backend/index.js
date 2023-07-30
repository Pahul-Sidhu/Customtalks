const mongoose = require("mongoose");
const mongoUrl =
  "mongodb+srv://Pahulsidhu:application2002@customtalks.v2cna1b.mongodb.net/?retryWrites=true&w=majority";

const connectdb = async () => {
  const con = await mongoose.connect(mongoUrl, () => {
    console.log("database connected");
  });
};
connectdb();

const jwt = require("jsonwebtoken");
const jwtstr = "AtmyDoors";
const user = require("./models/Users");
const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const port = 8000;
const cors = require("cors");

const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: "16mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "16mb", extended: true }));
app.use(express.json());
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

app.post("/signup", require("./routes/API"));
app.post("/signin", require("./routes/API"));
app.post("/details", require("./routes/API"));
app.post("/createchannel", require("./routes/API"));
app.post("/chatlist", require("./routes/API"));
app.post("/search", require("./routes/API"));
app.post("/invite", require("./routes/API"));
app.post("/acceptuser", require("./routes/API"));
app.post("/declineuser", require("./routes/API"));
app.post("/getmembers", require("./routes/API"));
app.post("/delete", require("./routes/API"));
app.post("/leave", require("./routes/API"));
app.get("/channellist", require("./routes/API"));
app.get("/getchannels", require("./routes/API"));
app.get("/notifs", require("./routes/API"));
app.get("/", require("./routes/API"));
app.post("/createchat", async (req, res) => {
  try {
    let data = jwt.verify(req.header("auth-token"), jwtstr);
    let u = await user.findOne({ _id: data.user.id });

    const isthere = await mongoose.connection.db
      .listCollections({ name: req.body.name })
      .next(async function (err, collinfo) {
        if (collinfo) {
          const collection = await mongoose.connection.db.collection(
            req.body.name
          );
          await collection.insertOne({
            name: u.username,
            chat: req.body.comment,
          });
          res.send("Chat posted");
        }
      });
  } catch (error) {
    console.log(error);
  }
});

io.on("connection", async (socket) => {
  socket.on("message", async (message) => {
    let data = jwt.verify(message.token, jwtstr);
    let u = await user.findOne({ _id: data.user.id });

    const isthere = await mongoose.connection.db
      .listCollections({ name: message.server })
      .next(async function (err, collinfo) {
        if (collinfo) {
          io.emit("return", {
            name: u.username,
            chat: message.chat,
            server: message.server,
          });
        }
      });
  });
});

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
