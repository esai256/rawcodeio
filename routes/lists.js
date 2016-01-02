var express = require('express');
var router = express.Router();
var snippetWorker = require('../workers/snippet-worker');
var listWorker = require('../workers/list-worker');
var config = require('../config/config');
var List = require('../models/list').List;



/* =======================================
    GET LISTS
   ======================================= */
router.get('/', function(req, res, next) {

  List.count({"public": true}, function( err, count){
    listWorker.recentLists(function(recent, err){
      res.render('lists', {
        count: count,
        pageid: 0,
        recentLists: recent,
        name: "List overview"
      });
    });
  });
});

router.get('/page/:pageid', function(req, res, next) {

  List.count({}, function(err, count){
    listWorker.recentPagedLists(req.params.pageid, count, function(recent, err){
      res.render('lists', {
        count: count,
        pageid: req.params.pageid,
        recentLists: recent
      });
    });
  });
});

/* =======================================
    CREATE NEW LIST
   ======================================= */
router.post('/create', function(req, res, next) {

  if(res.locals.user){
    var userid = res.locals.user.id,
        snippetID = req.body.listid;


    listWorker.createList(req.body, userid, function(thisListID, err){
      if(err){
        console.log(err);
      }

      // after creation, add snippet to list
      listWorker.addToList(snippetID, thisListID, function(result, err){
        if(err){
          console.log(err);
        }
      });
      // success
      res.send("New list has been created.");
    });

  } else {
    res.send("You must be logged in to create a new list.");
  }

});



/* =============================================
* DELETE LIST
* =========================================== */
router.post('/deletelist/:listid', function(req, res, next) {

  var userid = 0;
  if(res.locals.user){
    userid = res.locals.user.id;
  }

  listWorker.deleteList(req.params.listid, function(success, err) {
    if (err) {
      console.log(err);
      res.send("404");
    }
    // Garbage-Collector > Remove List ID in "inlist" Array
    listWorker.garbageCollector(req.params.listid, function(success, err) {
      if(err){
        console.log(err);
      }
      res.redirect('/lists');
    });

  });

});



/* =============================================
* DELETE SNIPPET FROM LIST
* =========================================== */
router.post('/deletesnippetfromlist/:listid/:snippetid', function(req, res, next) {

  var userid = 0;
  if(res.locals.user){
    userid = res.locals.user.id;
  }

  listWorker.deleteSnippetFomList(req.params.listid, req.params.snippetid, function(success, err) {
    if (err) {
      console.log(err);
      res.send("404");
    }
    res.redirect('/lists/'+req.params.listid);
  });

});





/* =======================================
    ADD SNIPPET TO LIST
   ======================================= */

router.post('/add', function(req, res, next) {
  listWorker.addToList(req.body.snippetid, req.body.listid, function(result, err){
    res.send(result);
  });
});



/* =======================================
    GET LIST > REDIRECT WITH NAME
   ======================================= */
router.get('/:list', function(req, res, next) {
  console.log(req.params.list);
  listWorker.getList(req.params.list, function(list, err){

    if(err){
      console.log(err);
      return res.render('list');
    }

    var list = list[0];

    // if list exists
    if (list != undefined){
      var id = list.id,
          name = list.name;

      if(name != ""){
        res.redirect('/lists/'+id+'/'+name);
      }else{
        res.redirect('/lists/'+id+'/noname');
      }
    } else {
      res.render('404');
    }
  });
});


/* =======================================
    GET SINGLE LIST PAGE WITH ID :list.
   ======================================= */
router.get('/:list/:name', function(req, res, next) {

  listWorker.getList(req.params.list, function(list, err){

    var list = list[0];

    listWorker.getSnippetsInList(list._id, function(snippetsInList, err){

        if(res.locals.user){
          currentUserid = res.locals.user.id;
        } else {
          currentUserid = "notloggedin";
        }

        res.render('singlelist', {
          list: list,
          snippets: snippetsInList,
          creator: list.creator,
          currentUserid: currentUserid
        });

    });

  });
});





module.exports = router;