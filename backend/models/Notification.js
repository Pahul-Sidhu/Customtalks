const mongoose = require('mongoose');
const { Schema } = mongoose;

const notif = new Schema({
  channel:{
    type:String,
    required:true
  },
  invitedby:{
    type:String,
    required:true
  },
  invitationto:{
    type:String,
    required:true
  }
});

module.exports = mongoose.model('notifications', notif);