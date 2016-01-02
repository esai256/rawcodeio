var bcrypt = require('bcrypt');
var User = require('../models/user').User;
var GitHubApi = require("github");

exports.addUser = function(user, next) {
    bcrypt.hash(user.password, 10, function(err, hash) {
      if (err) {
        return next(err);
      }
      user.password = hash;

        // force url-friendliness
        var name = user.username.replace(/[^A-Za-z0-9_-]/gi, '_').toLowerCase();

        var newUser = new User({
          username: name,
          email: user.email.toLowerCase(),
          password: user.password,
          userimage: "/img/default.png"
        });

        newUser.save(function(err) {
          if (err) {
            return next(err);
          }
          next(null);
        }); // end save
    }); // end bcrypt
};





exports.updateProfile = function(userid, reqbody, callback) {

  var query = {"_id": userid};
  var update = {email: reqbody.useremail,username: reqbody.username};
  if(reqbody.newpass){
    update = {email: reqbody.useremail,username: reqbody.username,password: reqbody.newpass};
  }
  User.findOneAndUpdate(query, update, function(err, result) {
    if (err) {
      console.log(err);
    }
    callback(null, result);
  });
}



exports.addGithubUser = function(user, next) {
 bcrypt.hash(user.password, 10, function(err, hash) {
    if (err) {
      return next(err);
    }
    user.password = hash;

    // console.log(user);

    // force url-friendliness
    var githubid = user.githubid,
        name = user.username.toLowerCase();
        email = user.email;


    var newUser = new User({
      username: name,
      password: user.password,
      email: email.toLowerCase(),
      userimage: user.userimage,
      githubid: githubid
    });

    newUser.save(function(err) {
      if (err) {
        return next(err, null);
      }
      next(null, newUser);
    }); // end save
  }); // end bcrypt
};




/* =======================================
    SAVE USER PREFERENECES
   ======================================= */
exports.updatePreferences = function(userid, reqbody, callback) {
  var query = {"_id": userid};
  var update = {settings: {colorscheme: reqbody.colorscheme, font: reqbody.font, fontsize: reqbody.fontsize}};
  User.findOneAndUpdate(query, update, function(err, result) {
      if (err) {
        console.log(err);
      }
      callback(null, result);
    });
};


/* =======================================
    FIND USER BY MAIL
   ======================================= */
exports.findUserByMail = function(email, next) {
  User.findOne({email: email.toLowerCase()}, function(err, user) {
    next(err, user);
  });
};

/* =======================================
    FIND USER BY GITHUB ID
   ======================================= */
exports.findUserByGithubid = function(githubid, next) {
  User.findOne({githubid: githubid}, function(err, user) {
    next(err, user);
  });
};


/* =======================================
    FIND USER BY ID
   ======================================= */
exports.findUserById = function(id, callback) {
  User.findOne({_id: id}, function(err, user) {
    if(err){
      console.log(err);
      callback(null, err);
    } else {
      callback(user, null);
    }
  });
};

/* =======================================
    FIND USER BY NAME (SEARCH)
   ======================================= */

exports.findUser = function(search, callback) {
  var regexp = ".*"+search+".*";
  User.find({username: new RegExp(regexp, "i")}, function(err, searchresult) {
    if(err){
      console.log(err);
      callback(null, err);
    } else {
      callback(searchresult, null);
    }
  });
};

/* =======================================
    GET ALL USERS
   ======================================= */

exports.getAllUsers = function(callback) {
 User.find({}, function( err, allUsers){
    callback(allUsers);
  });
};


/* =======================================
    COUNT ALL USERS
   ======================================= */

exports.countUsers = function(callback) {
 User.count({}, function( err, count){
    callback(count);
  });
};


/* =======================================
    ADD AVATAR IMAGE
   ======================================= */

exports.addImage = function(email, imagepath, callback) {
  // console.log(imagepath);
  var imagepath = imagepath.replace('public', '');
  var usrimg = {
    userimage: imagepath
  };

  User.findOneAndUpdate( { email: email } , usrimg, { upsert: true }, function(error, user) {
    callback(error, user);
  })
};



/* =======================================
    SET LAST VISIT
   ======================================= */
exports.setLastVisit = function(email, lastvisit, callback) {

  var lv = {
    lastvisit: lastvisit
  };

  User.findOneAndUpdate( { email: email } , lv, function(user, error) {
    callback(lv, error);
  })
};

/* =======================================
    LINK TO GITHUB ACCOUNT
   ======================================= */
exports.linkToGithub = function(githubusername, password, userid, callback) {

var github = new GitHubApi({
    version: "3.0.0",
    timeout: 20000
  });

  github.authenticate({
    type: "basic",
    username: githubusername,
    password: password
  });

  github.user.get({
      user: githubusername
    }, function(err, res) {
      if(err){
        console.log(err);
      }

      var githubid = res.id;
      var query = {"_id": userid};
      var update = {githubid: githubid};
      User.findOneAndUpdate(query, update, function(err, result) {
        if (err) {
          console.log(err);
        }
        callback(null, result);
      });

  });

};


/* =======================================
    CHECK USER API TOKEN
   ======================================= */

exports.checkAPIToken = function(apitoken, callback){
  User.findOne({token: apitoken}, function(err, user) {
    if(err){
      console.log(err);
    }
    // console.log('user: '+user);
    callback(user, err);
  });
};
