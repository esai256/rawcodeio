var express = require('express');
var router = express.Router();
var passport = require('passport');
var userService = require('../workers/user-worker');
var snippetWorker = require('../workers/snippet-worker');
var listWorker = require('../workers/list-worker');
var async = require('async');
var config = require('../config/config');


/* =============================================
* GET Snippets for user via AJAX
* =========================================== */
router.get('/:snippet', function(req, res, next) {
  


  snippetWorker.getSnippet(req.params.snippet, function(snippet, err){
    
    if(err){
      console.log(err);
      return res.send("couldn't embed snippet from rwacode.io");
    }

    var snippet = snippet[0];
    if (snippet != undefined){
      
      var id = snippet.id,
          name = snippet.name
          content = snippet.content;


      var html = '<!DOCTYPE html><html lang="en"><head> <meta charset="UTF-8"> <title>rawcode embed</title> <link rel="stylesheet" href="http://rawcode.io/css/main.css"></head><body> <div class="snippetcontent"><div class="snipwrap clearfix"> <div id="draghandler" draggable="true"></div><pre class="snippet"> <code class="hljs nginx">'+content+'</code> </pre> </div></div><script src="http://rawcode.io/js/main.js"></script></body></html>';

      res.send(html);

    } else {
      res.send("couldn't embed snippet from rwacode.io");
    }
  });



});




module.exports = router;