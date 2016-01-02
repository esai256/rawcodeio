var express = require('express');
var router = express.Router();
var snippetWorker = require('../workers/snippet-worker');
var config = require('../config/config');
var Snippet = require('../models/snippet').Snippet;



/* =============================================
* SNIPPETS OVERVIEW
* =========================================== */
router.get('/', function(req, res, next) {

  Snippet.count({}, function( err, count){
    snippetWorker.recentSnippets(function(recent, err){
      res.render('snippetoverview', {
        count: count,
        pageid: 0,
        recentSnippets: recent,
        bid: "snippetoverview",
        name: "Snippet overview"
      });
    });
  });


});



router.get('/page/:pageid', function(req, res, next) {

  Snippet.count({public:true, creator: { $ne: "0" }}, function(err, count){
    snippetWorker.recentPagedSnippets(req.params.pageid, count, function(recent, err){
      res.render('snippetoverview', {
        count: count,
        pageid: req.params.pageid,
        recentSnippets: recent
      });
    });
  });


});





/* =============================================
* CREATE SNIPPET
* =========================================== */
router.get('/create', function(req, res, next) {
  res.render('createsnippet', {
    bid: "createsnippet"
  });
});

/* POST save a snippet on create snippet page. */
router.post('/create', function(req, res, next) {

  var userid = 0;
  if(res.locals.user){
    userid = res.locals.user.id;
  }


  snippetWorker.addSnippet(req.body, userid, function(err) {
    if (err) {
      console.log(err);
    }
      res.redirect('/');
  });

});



/* =============================================
* EDIT SNIPPET
* =========================================== */
router.post('/saveedit/:snippetid', function(req, res, next) {

   var userid = 0;
  if(res.locals.user){
    userid = res.locals.user.id;
  }

  snippetWorker.saveEditedSnippet(req.params.snippetid, req.body, function(success, err) {
    if (err) {
      console.log(err);
      res.send("404");
    }
    res.redirect('/snippets/'+req.params.snippetid);
  });

});


/* =============================================
* DELETE SNIPPET
* =========================================== */
router.post('/deletesnippet/:snippetid', function(req, res, next) {

  var userid = 0;
  if(res.locals.user){
    userid = res.locals.user.id;
  }

  snippetWorker.deleteSnippet(req.params.snippetid, function(success, err) {
    if (err) {
      console.log(err);
      res.send("404");
    }
    res.redirect('/snippets');
  });

});





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

      if(name != ""){
        res.redirect('/snippets/'+id+'/'+encodeURIComponent(name));
      }else{
        res.redirect('/snippets/'+id+'/'+'noname');
      }


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

      var tags = snippet.tags.split(", ");
      if(res.locals.user){
        currentUserid = res.locals.user.id;
      } else {
        currentUserid = "notloggedin";
      }

      // http://localhost:3000/snippets/N1kScg5_/CSS%20transition
      // Make sure nobody accesses a private snippet

      if(snippet.public){
        res.render('singlesnippet', {
          id: snippet.id,
          name: snippet.name,
          content: snippet.content,
          info: snippet.info,
          tags: tags,
          upvote: snippet.upvotes,
          creator: snippet.creator,
          created: snippet.created,
          currentUserid: currentUserid,
          githuburl: snippet.github.url,
          bid: "single-snippet"
        });
      } else { // private snippet
        if(currentUserid && currentUserid == snippet.creator){
          res.render('singlesnippet', {
            id: snippet.id,
            name: snippet.name,
            content: snippet.content,
            info: snippet.info,
            tags: tags,
            upvote: snippet.upvotes,
            creator: snippet.creator,
            created: snippet.created,
            currentUserid: currentUserid,
            githuburl: snippet.github.url,
            bid: "single-snippet"
          });
        } else{
          res.render('404', {
            message: "The snippet you are trying to access is private."
          });
        }
      }
    } else {
      res.render('404');
    }
  });
});




/* =============================================
* IMPORT FROM GITHUB
* =========================================== */
router.post('/importgithub', function(req, res, next) {

  var githubname = req.body.githubusername;
  var githubpw = req.body.githubpw;

  snippetWorker.importFromGithub(githubname, githubpw, res.locals.user.id, function(success, err) {
    if (err) {
      console.log(err);
    }
    res.send(success);
  });

});



/* =======================================
    UPVOTE / DOWNVOTE
   ======================================= */
// up
router.post('/voteup', function(req, res, next) {
  if(res.locals.user){
    var user = res.locals.user.username,
        id = req.body.snippetid;

    snippetWorker.upvoteSnippet(id, function(success, err){
      if(err){
        res.send("an error occured.");
      }
      res.send("You upvoted this snippet.");
    });


  } else {
    res.send("You must be logged in to vote for a snippet.");
  }
});

// down
router.post('/votedown', function(req, res, next) {
  if(res.locals.user){
    var user = res.locals.user.username,
        id = req.body.snippetid;

    snippetWorker.downvoteSnippet(id, function(success, err){
      if(err){
        res.send("an error occured.");
      }
      res.send("You downvoted this snippet.");
    });


  } else {
    res.send("You must be logged in to vote for a snippet.");
  }
});

module.exports = router;