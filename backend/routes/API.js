const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bc = require("bcryptjs");
const jwt = require("jsonwebtoken");
const jwtstr = "AtmyDoors";
const givedetails = require("../middlewares/Getdetails");
const user = require("../models/Users");
const notification = require("../models/Notification");
const mongoose = require("mongoose");
const { Schema } = mongoose;

router.post(
  "/signup",
  [
    //Validating the credentials
    body("email").isEmail(),
    body("password").isLength({ min: 5 }),
    body("username").isLength({ min: 5 }),
    body("description").isLength({ min: 5 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    //return if any error occur while connecting to database
    try {
      //Checking if that email already exists
      let u = await user.findOne({ email: req.body.email });
      if (u) {
        return res
          .status(400)
          .json({ error: "A user account with this email already exists" });
      }

      //Checking if that username already exists
      u = await user.findOne({ username: req.body.username });
      if (u) {
        return res
          .status(400)
          .json({ error: "A user account with this username already exists" });
      }

      //Hashing the password before storing it
      const salt = await bc.genSalt(10);
      let crypted = await bc.hash(req.body.password, salt);

      //storing in database
      u = await user.create({
        username: req.body.username,
        password: crypted,
        email: req.body.email,
        description: req.body.description,
        image: req.body.image,
      });

      //creating jwt token
      const data = {
        user: {
          id: u.id,
        },
      };
      const jwtdata = jwt.sign(data, jwtstr);
      res.send({ token: jwtdata });
    } catch (error) {
      console.log(error);
      res.status(500).send("An error occured");
    }
  }
);

router.post(
  "/signin",
  [
    //Validating the credentials
    body("username", "Please enter a valid username").exists(),
    body("password", "Please enter a correct password").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    try {
      const password = req.body.password;
      let u = await user.findOne({ username: req.body.username });
      if (!u) {
        return res
          .status(400)
          .json({ error: "Please enter correct credentials" });
      }

      const pcompare = await bc.compare(password, u.password);
      if (!pcompare) {
        return res
          .status(400)
          .json({ error: "Please enter correct credentials" });
      }

      //creating jwt token
      const data = {
        user: {
          id: u.id,
        },
      };
      const jwtdata = jwt.sign(data, jwtstr);
      res.send({ token: jwtdata });
    } catch (error) {
      console.log(error);
      res.status(500).send("An error occured");
    }
  }
);

router.post("/details", givedetails, async (req, res) => {
  try {
    id = req.user.id;
    let data = await user.findOne({ _id: id }).select("-password");
    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send("An error occured");
  }
});

router.post(
  "/createchannel",
  [body("name").isLength({ min: 5 }), body("tags").isLength({ min: 5 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    try {
      let data = jwt.verify(req.header("auth-token"), jwtstr);
      let u = await user.findOne({ _id: data.user.id });
      mongoose.connection.db
        .listCollections({ name: req.body.name })
        .next(async function (err, collinfo) {
          if (collinfo) {
            return res
              .status(400)
              .send({ error: "A collection already exists by this name" });
          } else {
            mongoose.connection.createCollection(req.body.name, async () => {
              await user.updateOne(
                { username: u.username },
                { $push: { channels: req.body.name } }
              );
            });

            await mongoose.connection.db.collection("admins").insertOne({
              admin: u.username,
              channel: req.body.name,
            });

            return res.status(200).send({ success: "Channel created" });
          }
        });
    } catch (error) {
      return res.status(400).send({ error: "Connection failed" });
    }
  }
);

router.get("/channellist", async (req, res) => {
  let data = jwt.verify(req.header("auth-token"), jwtstr);
  let u = await user.findOne({ _id: data.user.id });
  res.send({ channels: u.channels });
});

router.post("/chatlist", async (req, res) => {
  let data = jwt.verify(req.header("auth-token"), jwtstr);
  let u = await user.findOne({ _id: data.user.id });

  const collection = await mongoose.connection.db.collection(req.body.name);
  collection.find({}).toArray(function (err, data) {
    res.send({ results: data, name: u.username });
  });
});

router.post("/search", async (req, res) => {
  let data = jwt.verify(req.header("auth-token"), jwtstr);
  let u = await user.findOne({ _id: data.user.id });

  try {
    let data = await user
      .findOne({ username: req.body.name })
      .select("-password");
    if (data) {
      if (data.username === u.username) {
        res.send({ nothing: "No user found" });
      } else {
        res.send(data);
      }
    } else {
      res.send({ nothing: "No user found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("An error occured");
  }
});

router.get("/getchannels", async (req, res) => {
  try {
    var collist = [];
    const data = await mongoose.connection.db
      .listCollections()
      .forEach((coll) => {
        if (
          coll.name != "users" &&
          coll.name != "notifications" &&
          coll.name != "admins"
        ) {
          collist.push(coll.name);
        }
      });
    res.send({ list: collist });
  } catch (error) {
    return res.status(400).send({ error: "Connection failed" });
  }
});

router.post("/invite", async (req, res) => {
  try {
    const data = await user.findOne({ username: req.body.user });
    if (data.channels.includes(req.body.channel)) {
      res.send({ message: "user is already in that channel" });
    } else {
      let data = jwt.verify(req.header("auth-token"), jwtstr);
      let u = await user.findOne({ _id: data.user.id });

      const find = await notification.findOne({
        channel: req.body.channel,
        invitedby: u.username,
        invitationto: req.body.user,
      });

      if (find) {
        res.send({ message: "invitation was already sent" });
      } else {
        await notification.create({
          channel: req.body.channel,
          invitedby: u.username,
          invitationto: req.body.user,
        });
        res.send({ message: "Invitation sent" });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("An error occured");
  }
});

router.get("/notifs", async (req, res) => {
  try {
    let data = jwt.verify(req.header("auth-token"), jwtstr);
    let u = await user.findOne({ _id: data.user.id });

    let notifications = [];

    const notif = await notification.find({});

    if (notif) {
      notif.forEach((element) => {
        if (element.invitationto === u.username) {
          notifications.push(element);
        }
      });

      if (notifications) {
        return res.send({ notifs: notifications });
      }
    }

    return res.send({ message: "nothing found" });
  } catch (error) {
    return res.status(400).send({ error: "Connection failed" });
  }
});

router.post("/declineuser", async (req, res) => {
  try {
    let data = jwt.verify(req.header("auth-token"), jwtstr);
    let u = await user.findOne({ _id: data.user.id });

    const del = await notification
      .deleteOne({
        channel: req.body.channel,
        invitedby: req.body.invited,
        invitationto: u.username,
      })
      .then(function () {
        console.log("Data deleted"); // Success
      })
      .catch(function (error) {
        console.log(error); // Failure
      });

    return res.send({ message: "decline accepted" });
  } catch (error) {
    return res.status(400).send({ error: "Connection failed" });
  }
});

router.post("/acceptuser", async (req, res) => {
  try {
    let data = jwt.verify(req.header("auth-token"), jwtstr);
    let u = await user.findOne({ _id: data.user.id });

    const del = await notification
      .deleteOne({
        channel: req.body.channel,
        invitedby: req.body.invited,
        invitationto: u.username,
      })
      .then(function () {
        console.log("Data deleted"); // Success
      })
      .catch(function (error) {
        console.log(error); // Failure
      });

    await user.updateOne(
      { username: u.username },
      { $push: { channels: req.body.channel } }
    );

    res.send({ message: "User accepted" });
  } catch (error) {
    return res.status(400).send({ error: "Connection failed" });
  }
});

router.post("/getmembers", async (req, res) => {
  try {
    var member = [];

    const fetch = await user.find({});

    fetch.forEach((element) => {
      if (element.channels.includes(req.body.name)) {
        member.push(element.username);
      }
    });

    res.send({ members: member });
  } catch (error) {
    return res.status(400).send({ error: "Connection failed" });
  }
});

router.post("/delete", async (req, res) => {
  try {
    let data = jwt.verify(req.header("auth-token"), jwtstr);
    let u = await user.findOne({ _id: data.user.id });

    const fetch = await mongoose.connection.db.collection("admins");

    const isthere = await fetch.findOne({ admin: u.username });

    if (isthere) {
      await fetch.deleteOne({ admin: u.username });
      await user.updateMany({ $pull: { channels: req.body.name } });
      await mongoose.connection.db
        .collection(req.body.name)
        .drop(function (err, delOK) {
          if (err) throw err;
          if (delOK) console.log("Collection deleted");
        });
      res.send({ success: "channel deleted" });
    } else {
      res.send({ message: "You don't have privileges to delete channel" });
    }
  } catch (error) {
    return res.status(400).send({ error: "Connection failed" });
  }
});

router.post("/leave", async (req, res) => {
  try {
    let data = jwt.verify(req.header("auth-token"), jwtstr);
    let u = await user.findOne({ _id: data.user.id });

    const fetch = await mongoose.connection.db.collection("admins");

    const isthere = await fetch.findOne({ admin: u.username });

    if (isthere) {
      await fetch.deleteOne({ admin: u.username });
      await user.updateMany({ $pull: { channels: req.body.name } });
      await mongoose.connection.db
        .collection(req.body.name)
        .drop(function (err, delOK) {
          if (err) throw err;
          if (delOK) console.log("Collection deleted");
        });
      res.send({ success: "channel deleted" });
    } else {
      await user.updateOne({ username: u.username }, { $pull: { channels: req.body.name } });
      res.send({ message: "channel left" });
    }


  } catch (error) {
    return res.status(400).send({ error: "Connection failed" });
  }
});

module.exports = router;
