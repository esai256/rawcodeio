var express = require('express');
var router = express.Router();
var snippetWorker = require('../workers/snippet-worker');
var config = require('../config/config');
var Snippet = require('../models/snippet').Snippet;


/* =============================================
* GET single snippet -> redirect to /:id/:name
* =========================================== */

router.get('/:snippet', function(req, res, next) {

  snippetWorker.getSnippet(req.params.snippet, function(snippet, err){

    if(err){
      console.log(err);
      return res.render('snippet');
    }

    var snippet = snippet[0];

    // if snippet exists
    if (snippet != undefined){
      var id = snippet.id,
          name = snippet.name;

      res.redirect('/snippets/'+id+'/'+name);
    } else {
      res.render('404');
    }
  });
});



/* =============================================
* GET single snippet page with id :snippet.
* =========================================== */

router.get('/:snippet/:name', function(req, res, next) {

  snippetWorker.getSnippet(req.params.snippet, function(snippet, err){

    if(err){
      console.log(err);
      return res.render('snippet');
    }

    var snippet = snippet[0];

    // if snippet exists
    if (snippet != undefined){

      if(snippet.public){
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('content-type', 'text/plain');
        res.send(snippet.content);
      } else { // private snippet
        if(currentUserid && currentUserid == snippet.creator){
          res.setHeader('X-Content-Type-Options', 'nosniff');
          res.setHeader('content-type', 'text/plain');
          res.send(snippet.content);
        } else{
          res.render('404');
        }
      }
    } else {
      res.render('404');
    }
  });
});


module.exports = router;