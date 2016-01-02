module.exports = function() {
var passport = require('passport');
var bcrypt = require('bcrypt');
var passportLocal = require('passport-local');
var GithubStrategy = require('passport-github').Strategy;
var userService = require('../workers/user-worker');

  passport.use(new passportLocal.Strategy({usernameField: 'email'}, function(email, password, next) {
    userService.findUserByMail(email, function(err, user) {
      if (err) {
        return next(err);
      }
      if (!user) {
        return next(null, null);
      }
      bcrypt.compare(password, user.password, function(err, same) {
        if (err) {
          return next(err);
        }
        if (!same) {
          return next(null, null);
        }
        next(null, user);
      });
    });
  }));


  // TODO: @BenMann move into env file
  passport.use(new GithubStrategy({
    clientID: 'keyboardcat',
    clientSecret: 'keyboardcat',
    callbackURL: 'http://localhost:3000/auth/callback'
  }, function(accessToken, refreshToken, profile, done){
    done(null, {
      accessToken: accessToken,
      profile: profile
    });
  }));



  passport.serializeUser(function(user, next) {
    next(null, user.email);
  });

  passport.deserializeUser(function(email, next) {
    userService.findUserByMail(email, function(err, user) {
      next(err, user);
    });
  });
};