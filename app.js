var express = require('express'),
    path = require('path'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    GithubStrategy = require('passport-github').Strategy,
    expressSession = require('express-session'),
    connectMongo = require('connect-mongo'),
    MongoStore = connectMongo(expressSession),
    multer = require('multer'),
    async = require('async'),
    shortid = require('shortid'),
    GitHubApi = require("github"),
    dateFormat = require('dateformat'),
    hat = require('hat');

var config = require('./config/config.js'),
    routes = require('./routes/index'),
    snippet = require('./routes/snippet'),
    lists = require('./routes/lists'),
    users = require('./routes/users'),
    rawsnippet = require('./routes/rawsnippet');

var api = require('./routes/api');
var documentation = require('./routes/documentation');
var embed = require('./routes/embed');
var snipit = require('./routes/snipit');
var newstuff = require('./routes/newstuff');

var backend = require('./routes/backend');


var passportConfig = require('./auth/passport-config');
var restrict = require('./auth/restrict');
passportConfig();

mongoose.connect(config.mongoUri);

var app = express();





app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(multer({
  dest: './public/uploads/userimages/',
  rename: function (fieldname, filename) {
    return filename.replace(/\W+/g, '-').toLowerCase();
  }
}));


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// TODO: @BenMann move to env file..
app.use(expressSession({
    secret: 'keyboardcat',
    saveUninitialized: false,
    resave: false,
    store: new MongoStore({
       mongooseConnection: mongoose.connection
    })
  }
));

app.use(passport.initialize());
app.use(passport.session());

var listWorker = require('./workers/list-worker');
var userService = require('./workers/user-worker');
var newsWorker = require('./workers/news-worker');

// For every request: provide user data to the view
app.use(function(req, res, next) {
  if(req.user) {
    // pass user
    res.locals.user = req.user;

    // news since last login
    if(req.user.lastvisit){
      newsWorker.getNews(req.user.lastvisit, function(news,err){
        if(news == undefined){
          res.locals.newsamount = 0;
        } else {
          var amount = news.length;
          res.locals.newsamount = amount;
        }
      });
    }

    // pass user's lists
    listWorker.getListsForUser(req.user._id, function(listos, err) {
      res.locals.userlists = listos;
      next();
    });

  } else {
    next();
  }
});


app.use('/', routes);
app.use('/snippets', snippet);
app.use('/lists/', lists);
app.use('/users/', users);

app.use('/raw', rawsnippet);
app.use('/api/', api);
app.use('/documentation/', documentation);
app.use('/embed/', embed);
app.use('/snipit/', snipit);
app.use('/newstuff/', newstuff);

app.use('/backend/', backend);


// error handler
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('404', {
        message: err.message,
        error: {}
    });
});



app.set('port', process.env.PORT || 3000);
var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});

module.exports = app;