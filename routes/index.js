var express = require('express');
var router = express.Router();
var passport = require('passport');
var userService = require('../workers/user-worker');
var snippetWorker = require('../workers/snippet-worker');
var listWorker = require('../workers/list-worker');
var newsWorker = require('../workers/news-worker');
var async = require('async');
var config = require('../config/config');
var dateFormat = require('dateformat');
var GitHubApi = require("github");


/* GET home page. */
router.get('/', function(req, res, next) {

  snippetWorker.popularSnippets(function(popular, err){
    snippetWorker.countSnippets(function(snippetcount, err){
        snippetWorker.countLists(function(listcount, err){
          userService.countUsers(function(usercount, err){

            res.render('index', {
              usercount: usercount,
              snippetcount: snippetcount,
              listcount: listcount,
              popularSnippets: popular
            });

        });
      });
    });
  });
});


/* =============================================
* GET SEARCH TEMPLATE
* =========================================== */
router.get('/search', function(req, res, next) {
  res.render('search');
});



/* =============================================
* POST SEARCH VIA FORM
* =========================================== */
router.post('/search', function(req, res, next) {

  snippetWorker.findSnippet(req.body.searchterm, function(result, err){

    if(err){
      console.log(err);
      return res.render('snippet');
    }

    var searchterm = req.body.searchterm;

    if (result != undefined){
      res.render('searchresult', {
        searchterm: searchterm,
        result:result,
        name: "Search"
      });
    } else {
      res.render('404');
    }

  });
});



/* =============================================
* POST SEARCH SNIPPETS FOR CERTAIN USER
* =========================================== */
router.post('/search/:userid', function(req, res, next) {

  var searchtype = req.body.searchtype,
      searchterm = req.body.searchterm;


  // PUBLIC SNIPPETS
  if(searchtype == "pubsnippets"){
    snippetWorker.findSnippetByUser(req.body.searchterm, req.params.userid,function(result, err){
      if(err){
        console.log(err);
        return res.render('snippet');
      }
      if (result != undefined){
        res.render('searchresult', {
          searchterm: searchterm,
          result:result
        });
      } else {
        res.render('404');
      }
    });
  }

  // PRIVATE SNIPPETS
  if(searchtype == "privsnippets"){
    snippetWorker.findPrivateSnippetByUser(req.body.searchterm, req.params.userid,function(result, err){
      if(err){
        console.log(err);
        return res.render('snippet');
      }
      if (result != undefined){
        res.render('searchresult', {
          searchterm: searchterm,
          result:result
        });
      } else {
        res.render('404');
      }
    });
  }

  // PUBLIC LISTS
  if(searchtype == "publists"){
    listWorker.findListByUser(req.body.searchterm, req.params.userid, function(result, err){
      if(err){
          console.log(err);
        }
      if(result != undefined){
        res.render('listsearchresult', {
          searchterm: searchterm,
          result:result
        });
      } else {
        res.render('404');
      }
    });
  }

  // PRIVATE LISTS
  if(searchtype == "privlists"){
    listWorker.findListByUser(req.body.searchterm, req.params.userid, function(result, err){
      if(err){
          console.log(err);
        }
      if(result != undefined){
        res.render('listsearchresult', {
          searchterm: searchterm,
          result:result
        });
      } else {
        res.render('404');
      }
    });
  }




});



/* =============================================
* POST SEARCH SNIPPETS IN CERTAIN LISTS
* =========================================== */
router.post('/searchlist/:listid', function(req, res, next) {

  var searchterm = req.body.searchterm;

  listWorker.getList(req.params.listid, function(list, err){

    var list = list[0];

    snippetWorker.findSnippetsInList(list._id, searchterm, function(snippetsInList, err){

        if(err){
          console.log(err);
          return res.render('snippet');
        }

        var searchterm = req.body.searchterm;

        if (snippetsInList != undefined){
          res.render('searchresult', {
            searchterm: searchterm,
            result: snippetsInList
          });
        } else {
          res.render('404');
        }

    });

  });
});



/* =============================================
* POST SEARCH FOR SPECIFIC USER
* =========================================== */
router.post('/searchuser', function(req, res, next) {

  userService.findUser(req.body.searchterm, function(result, err){

    if(err){
      console.log(err);
      return res.render('users');
    }

    var searchterm = req.body.searchterm;

    if (result != undefined){
      res.render('usersearchresult', {
        searchterm: searchterm,
        result: result
      });
    } else {
      res.render('404');
    }

  });
});


/* =============================================
* POST SEARCH FOR SPECIFIC LIST
* =========================================== */
router.post('/searchlists', function(req, res, next) {

  listWorker.findList(req.body.searchterm, function(result, err){

    if(err){
      console.log(err);
      return res.render('lists');
    }

    var searchterm = req.body.searchterm;

    if (result != undefined){
      res.render('listsearchresult', {
        searchterm: searchterm,
        result: result
      });
    } else {
      res.render('404');
    }

  });
});




/* =============================================
* GET SEARCH VIA URL
* =========================================== */
router.get('/search/:searchterm', function(req, res, next) {

  snippetWorker.findSnippet(req.params.searchterm, function(result, err){

    if(err){
      console.log(err);
      return res.render('snippet');
    }

    // console.log("RESULT: "+result);

    var searchterm = req.params.searchterm;



    if (result != undefined){
      res.render('searchresult', {
        searchterm: searchterm,
        result:result
      });
    } else {
      res.render('404');
    }

  });
});




router.get('/search/page/:pageid', function(req, res, next) {
  snippetWorker.findSnippetLimited(req.params.searchterm, function(result, err){

    if(err){
      console.log(err);
      return res.render('snippet');
    }

    var searchterm = req.params.searchterm;

    if (result != undefined){
      res.render('searchresult', {
        searchterm: searchterm,
        result:result
      });
    } else {
      res.render('404');
    }

  });
});



/* =============================================
* EDIT SNIPPET
* =========================================== */

router.post('/editsnippet/:snipid', function(req, res, next) {

  var curruserid = req.body.curruserid;

  if(curruserid == res.locals.user.id){

      snippetWorker.getSnippet(req.params.snipid, function(snippet, err){

        if(err){
          console.log(err);
          return res.render('snippet');
        }

        var snippet = snippet[0];

        // if snippet exists
        if (snippet != undefined){
           res.render('editsnippet', {
            snippet: snippet,
            bid: "createsnippet"
          });
        } else {
          res.render('404');
        }
      });

  } else {
    res.redirect('/snippets/'+req.params.snipid);
  }

});






/* =============================================
* EDIT LIST
* =========================================== */

router.post('/editlist/:listid', function(req, res, next) {

  var curruserid = req.body.curruserid;
  if(curruserid == res.locals.user.id){

    listWorker.getList(req.params.listid, function(list, err){

      if(err){
        console.log(err);
        return res.render('list');
      }

      var list = list[0];

      listWorker.getSnippetsInList(list._id, function(snippetsInList, err){

        if(res.locals.user){
          currentUserid = res.locals.user.id;
        } else {
          currentUserid = "notloggedin";
        }

        res.render('editlist', {
          list: list,
          snippets: snippetsInList,
          creator: list.creator,
          currentUserid: currentUserid
        });

      });


    });

  } else {
    res.redirect('/lists/'+req.params.listid);
  }

});






/* =============================================
* USER
* =========================================== */


/* GET login page*/
router.get('/login', function(req, res, next) {
  res.render('login', {
    error: "",
    name: "login or register"
  });
});

/* POST create - register a new user */
router.post('/register', function(req, res, next) {

  userService.findUserByMail(req.body.email, function(err, user) {
    if(user){
      res.render('login', {
        error: "An account with this E-Mail address is already registered"
      });
    } else { // if user isn't in db => register

      // retyped mail didn't match
      if(req.body.email != req.body.emailretype){
        res.render('login', {
          error: "The re-typed E-Mail doen't match"
        });
      }else{
        // actually add user
        userService.addUser(req.body, function(err) {
          if (err) {
            console.log(err);
            var vm = {
              title: 'Create an account',
              input: req.body,
              error: err
            };
            delete vm.input.password;
            return res.render('login');
          }
          req.login(req.body, function(err) {
            res.redirect('/users/'+req.user._id);
          });
        });

      } // else ende
    }
  });






});

/* POST login - login to existing account */
router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (!user) {
      return res.redirect('/login');
    }
    console.log(info);
    console.log(user);

    req.logIn(user, function(err) {
      return res.redirect('/users/'+user.id+"/"+user.username);
    });

  })(req, res, next);
});


/* GET logout - user abmelden */
router.get('/logout', function(req, res, next) {

  // memorize last visit
  var now = new Date();
  userService.setLastVisit(req.user.email, now, function(result, err){
    if(err){
      console.log(err);
    }
  });

  req.logout();
  req.session.destroy();
  res.redirect('/');
});



/* =======================================
    GitHub auth
   ======================================= */

/* POST login - login to existing account */
router.post('/auth/callback', function(req, res, next) {
  passport.authenticate('github')(req, res, next);
});

/* GET login - login to existing account OR register new one */
router.get('/auth/callback', function(req, res, next) {
  passport.authenticate('github', function(err, authedUser, info) {
    if (!authedUser) {
      return res.redirect('/login');
    }

    var githubid = authedUser.profile.id,
        username = authedUser.profile.username,
        userimage = authedUser.profile._json.avatar_url;

    userService.findUserByGithubid(githubid, function(err, user) {
      if(user){ // user exists: login!
        req.logIn(user, function(err) {
          return res.redirect('/users/'+user.id+"/"+user.username);
        });
      }else{ // register
        res.render('githubRegistration', {
          error: "",
          githubid: githubid,
          username: username,
          userimage: userimage
        });
      } // else (register) ende
    });

  })(req, res, next);
});



/* Actual registration if coming from github */
router.post('/registergithub', function(req, res, next) {
  var user = req.body,
      githubid = user.githubid,
      username = user.username,
      userimage = user.userimage;

    userService.findUserByMail(req.body.email, function(err, user) {
      if(user){ // e-mail is alrdy in database / user is alrdy registered
        res.render('githubRegistration', {
          error: "An account with this E-Mail address is already registered",
          githubid: githubid,
          username: username,
          userimage: userimage
        });
      } else { // actually register

        userService.addGithubUser(req.body, function(err, user) {
          if(err){
            console.log(err);
          }
          req.logIn(user, function(err) {
            return res.redirect('/users/'+user.id+"/"+user.username);
          });
        });
    } // else ende
  }); // findUserByMail ende
});



/* =======================================
    ADD GitHub to existing account
   ======================================= */
router.post('/linktogithub', function(req, res, next) {
  var githubname = req.body.githubusername;
  var githubpw = req.body.githubpw;

  userService.linkToGithub(githubname, githubpw, res.locals.user.id, function(err, success) {
    if (err) {
      console.log(err);
    }
    res.send("Your account was linked to GitHub!");
  });
});



/* =======================================
    STATIC PAGES
   ======================================= */

router.get('/resources', function(req, res, next) {
  res.render('static/about/resources',{
    bid: "resources"
  });
});

router.get('/about', function(req, res, next) {
  res.render('static/about/site', {
    bid: "about"
  });
});

router.get('/license', function(req, res, next) {
  res.render('static/license');
});

router.get('/impressum', function(req, res, next) {
  res.render('static/impressum');
});

router.get('/terms', function(req, res, next) {
  res.render('legal/terms');
});

router.get('/privacy', function(req, res, next) {
  res.render('legal/privacy');
});

router.get('/introduction', function(req, res, next) {
  res.render('static/introduction',{
    bid: "introduction"
  });
});




module.exports = router;
