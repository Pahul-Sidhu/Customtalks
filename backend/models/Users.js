const mongoose = require('mongoose');
const { Schema } = mongoose;

const Users = new Schema({
  username:{
    type:String,
    unique:true,
    required:true
  },
  email:{
    type:String,
    unique:true,
    required:true
  },
  password:{
    type:String,
    required:true
  },
  image:{
    type:String,
  },
  description:{
    type:String,
    required:true
  },
  timestamp:{
    type:Date,
    default:Date.now
  },
  channels:[String]
});

module.exports = mongoose.model('users', Users);