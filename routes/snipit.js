var express = require('express');
var router = express.Router();
var snippetWorker = require('../workers/snippet-worker');
var config = require('../config/config');
var Snippet = require('../models/snippet').Snippet;

router.post('/', function(req, res, next) {  
   res.render('snip', {
    snip: req.body.snip
   });
});


module.exports = router;