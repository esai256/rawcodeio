var express = require('express');
var router = express.Router();
var passport = require('passport');
var userService = require('../workers/user-worker');
var snippetWorker = require('../workers/snippet-worker');
var listWorker = require('../workers/list-worker');
var async = require('async');
var config = require('../config/config');


// HACK: erhm.. write something serious to make API private
// OR finally write public API and use here as well


/* =============================================
* GET Snippets for user via AJAX
* =========================================== */
router.get('/snippets/:userid', function(req, res, next) {

  if(req.get('Referer').substring(7, 17) == 'rawcode.io'){ // Keep API private

    var userid = req.params.userid;
    snippetWorker.getSnippetForUser(userid, function(result, err){
      if(err){
        console.log(err);
      }
      res.send(result)
    });

  }
});

/* =============================================
* GET PRIVATE Snippets for user via AJAX
* =========================================== */
router.get('/privsnippets/:userid', function(req, res, next) {

  if(req.get('Referer').substring(7, 17) == 'rawcode.io'){ // Keep API private

    var userid = req.params.userid;
    snippetWorker.getPrivateSnippetForUser(userid, function(result, err){
      if(err){
        console.log(err);
      }
      res.send(result)
    });

  }
});


/*=============================================
* GET Lists for user via AJAX
* =========================================== */
router.get('/lists/:userid', function(req, res, next) {

  if(req.get('Referer').substring(7, 17) == 'rawcode.io'){ // Keep API private

    var userid = req.params.userid;
    listWorker.getListsForUser(userid, function(result, err){

      console.log(result);

      if(err){
        console.log(err);
      }
      res.send(result)
    });

  }
});

/*=============================================
* GET PRIVATE Lists for user via AJAX
* =========================================== */
router.get('/privlists/:userid', function(req, res, next) {

  if(req.get('Referer').substring(7, 17) == 'rawcode.io'){ // Keep API private

    var userid = req.params.userid;
    listWorker.getPrivateListsForUser(userid, function(result, err){


      if(err){
        console.log(err);
      }
      res.send(result)
    });

  }
});











/* =============================================
* PUBLIC SEARCH FOR ALL SNIPPETS WITH API TOKEN
* =========================================== */
router.get('/search/:apitoken/:searchterm', function(req, res, next) {

  res.setHeader('Access-Control-Allow-Origin', null);
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  userService.checkAPIToken(req.params.apitoken, function(user, err){
    snippetWorker.findSnippetByUser(req.params.searchterm, user._id, function(result, err){
      if(err){
        console.log("ERORR: "+err);
        res.send("Whoops, an error has occured! If this keeps repeating, let us know!");
      }
      if (result != undefined){
        console.log('result: '+result);
        res.send(result);
      } else {
        res.send('An error occured, try again later.');
      }

    });
  })
});






module.exports = router;




