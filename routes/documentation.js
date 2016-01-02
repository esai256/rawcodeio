var express = require('express');
var router = express.Router();
var passport = require('passport');
var userService = require('../workers/user-worker');
var snippetWorker = require('../workers/snippet-worker');
var listWorker = require('../workers/list-worker');
var async = require('async');
var config = require('../config/config');



router.get('/', function(req, res, next) {
  res.render('documentation/documentation', {
    bid: "documentation"
  });
});
router.get('/features', function(req, res, next) {res.render('documentation/features');});
router.get('/workflow', function(req, res, next) {res.render('documentation/workflow');});
router.get('/api', function(req, res, next) {res.render('documentation/api');});
router.get('/other', function(req, res, next) {res.render('documentation/other');});


module.exports = router;