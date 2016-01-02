var express = require('express');
var router = express.Router();
var passport = require('passport');
var fs = require('fs');
var multer = require('multer');
var im = require('imagemagick');

var userService = require('../workers/user-worker');
var snippetWorker = require('../workers/snippet-worker');
var config = require('../config/config');


/* GET users listing. */
// router.get('/', function(req, res, next) {

//   userService.getAllUsers(function(allUsers, err){
//     userService.countUsers(function(usercount, err){

//       res.render('users', {
//         allUsers: allUsers,
//         count: usercount
//       });

//     });
//   });
// });


/* =======================================
    USER BY ID IN URL => redirect
   ======================================= */

router.get('/:id', function(req, res, next) {
  var id = req.user._id;
  userService.findUserById(id, function(result, err){
    if(err){
      console.log(err);
      return res.redirect('/');
    }
    var name = result.username,
        id = result.id;
     res.redirect('/users/'+id+'/'+name);
  });
});


/* =======================================
    FULL USER URL
   ======================================= */

router.get('/:id/:name', function(req, res, next) {

  var id = req.params.id;

  snippetWorker.getSnippetForUser(id, function(snippets, err) {

      userService.findUserById(id, function(result, err){
        if(err){
          console.log(err);
          return res.render('/');
        }

        var user = result;
        if(res.locals.user){
          currentUserid = res.locals.user.id;
        } else {
          currentUserid = "notloggedin";
        }
        res.render('useraccount', {
          userprofile: user,
          snippets: snippets,
          currentUser: currentUserid,
          bid: "useraccount",
          userViewsID: id
        });
      });

  });
});


/* =======================================
    EDIT USER
   ======================================= */

router.get('/:id/:name/edit', function(req, res, next) {

  var id = req.params.id,
      loggedinUser = res.locals.user;

  userService.findUserById(id, function(result, err){
    if(err){
      console.log(err);
      return res.render('/');
    }

    if (loggedinUser){
      if(result.id == loggedinUser.id){
        var user = result;
        res.render('edituser', {
          userprofile: user,
          currentUser: id
        });
      } else { 
        var name = result.username,
            id = result.id;
        res.redirect('/users/'+id+'/'+name);
      } // if user can edit
    } else { // if not logged in at all
    var name = result.username,
            id = result.id;
        res.redirect('/users/'+id+'/'+name);
    }
  });
});






/* =======================================
    UPLOAD USER AVATAR
   ======================================= */

router.post('/savesettings', function(req, res, next) {


  // Helper functions
  var imgs = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'JPG'];
  function getExtension(fn) {return fn.split('.').pop();}
  function fnAppend(fn, insert) {
    var arr = fn.split('.');
    var ext = arr.pop();
    insert = (insert !== undefined) ? insert : new Date().getTime();
    return arr + '_' + insert + '.' + ext;
  }


  // If file upload exists
  // get img, reszie + rename, delete original
  if(req.files.userimg){
    if (imgs.indexOf(getExtension(req.files.userimg.name)) != -1){
      im.resize({
        srcPath: req.files.userimg.path,
        dstPath: fnAppend(req.files.userimg.path, 'thumb'),
        // height:   120,
        // width:   120
        strip : false,
        width : 240,
        height : "240^",
        customArgs: [
                      "-gravity", "center",
                      "-extent", "240x240"
                    ]

      }, function(err, stdout, stderr){

        if (err) throw err;
          // delete temporary
          fs.unlink(req.files.userimg.path, function(){
        });

        // store to db
        userService.addImage(res.locals.user.email, fnAppend(req.files.userimg.path, 'thumb'), function(error, user) {
          if(error) {
            console.log(error);
          } else {
            //call update fn
            userService.updateProfile(res.locals.user.id, req.body, function(err, result) {
              if(err){
                console.log('error');
              }
              res.redirect('/users/'+res.locals.user.id);

            });
          }
        })
      });
    }
  } else {
    //call update fn
    userService.updateProfile(res.locals.user.id, req.body, function(err, result) {
      if(err){
        console.log('error');
      }
      res.redirect('/users/'+res.locals.user.id);

    });
  }

});


/* =======================================
    USER PREFERENECES
   ======================================= */

router.post('/savepref', function(req, res, next) {
  userService.updatePreferences(res.locals.user.id, req.body, function(err, result) {
    if(err){
      console.log(err);
    }
    res.send("Preferences successfully saved.");
  });
});




module.exports = router;