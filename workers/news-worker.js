var Snippet = require('../models/snippet').Snippet;
var List = require('../models/list').List;
var User = require('../models/user').User;
var News = require('../models/news').News;
var shortid = require('shortid');
var async = require('async');



/* =======================================
    ADD NEWS
   ======================================= */
exports.addNews = function(news, callback) {
 var newNews = new News({
      content: news.newscontent
    });

 newNews.save(function(err) {
  if (err) {
      return callback(err);
    }
    callback(null);
  });
};



/* =======================================
    GET NEWS
   ======================================= */
exports.getNews = function(date, callback) {
  News.find({created: {$gte: date}}).limit(15).exec(function(err, orderedCollecion) {
    callback(orderedCollecion);
  });
};


/* =======================================
    GET ALL NEWS
   ======================================= */
exports.getAllNews = function(callback) {
  News.find({}).sort('-created').exec(function(err, orderedCollecion) {
    callback(orderedCollecion);
  });
};