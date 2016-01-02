var express = require('express');
var router = express.Router();
var passport = require('passport');
var userService = require('../workers/user-worker');
var snippetWorker = require('../workers/snippet-worker');
var listWorker = require('../workers/list-worker');
var newsWorker = require('../workers/news-worker');
var config = require('../config/config');
var dateFormat = require('dateformat');



router.get('/', function(req, res, next) {
  newsWorker.getNews(req.user.lastvisit, function(latest,err){
    newsWorker.getAllNews(function(news, err){
      
      res.render('newstuff',{
        news: news,
        latest: latest,
        bid: "news"
      });
      
    });
  });
});


router.post('/create', function(req, res, next) {
  newsWorker.addNews(req.body, function(result, err){
    if(err){
      console.log(err);
    }
    res.redirect("/");
  });
});





module.exports = router;




