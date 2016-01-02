var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var userService = require('../workers/user-worker');
var shortid = require('shortid');
var hat = require('hat');

// API token
var token = hat();
var privatetoken = hat();

var userSchema = new Schema({
  _id: {type: String, index: { unique: true } ,'default': shortid.generate},
  username: {type: String, required: 'Please enter a username'},
  email: {type: String, required: 'Please enter your email'},
  password: {type: String, required: 'Please enter your password'},
  userimage: String,
  created: {type: Date, default: Date.now},
  lastvisit: {type: Date, default: Date.now},
  token: {type: String, default: token},
  privatetoken: {type: String, default: privatetoken},
  settings: {
    colorscheme: {type: String, default: "zenburn"},
    font: {type: String, default: "monospace"},
    fontsize: {type: String, default: "16px"}
  },
  githubid: {type: Number, default: ""}
});


var User = mongoose.model('User', userSchema);

module.exports = {
  User: User
};