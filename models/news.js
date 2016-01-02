var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var shortid = require('shortid');

var newsSchema = new Schema({
  _id: {type: String, index: { unique: true } ,'default': shortid.generate},  
  content: String,
  created: {type: Date, default: Date.now}
});


var News = mongoose.model('News', newsSchema);

module.exports = {
  News: News
};