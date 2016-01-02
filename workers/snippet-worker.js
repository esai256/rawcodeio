var express = require('express');
var config = require('../config/config');
var Snippet = require('../models/snippet').Snippet;
var snippetWorker = require('../workers/snippet-worker');
var List = require('../models/list').List;
var User = require('../models/user').User;
var shortid = require('shortid');
var async = require('async');
var GitHubApi = require("github");

var helper = require('../helper');






/* =======================================
    ADD SNIPPET
   ======================================= */

exports.addSnippet = function(snippet, userid, next) {

  var pub,
      githubname,
      githubURL;

  snippet.onoffswitch == "Public" ? pub = true : pub = false;

  if (snippet.github){
    githubname = snippet.github.username;
    githubURL = snippet.github.url;
  }else{
    githubname =  "";
    githubURL =  "";
  }

   var newSnippet = new Snippet({
        name: snippet.name,
        content: snippet.content,
        info: snippet.info,
        tags: snippet.tags,
        creator: userid,
        upvotes: 0,
        public: pub,
        language: snippet.language,
        github: {username: githubname, url: githubURL}
      });

   newSnippet.save(function(err) {
    if (err) {
        return next(err);
      }
      next();
    });

}; // addSnippet ende



/* =======================================
    SAVE EDITED SNIPPET
   ======================================= */
exports.saveEditedSnippet = function(snippetid, snippet, callback) {

  var pub,
      githubname,
      githubURL;

  snippet.onoffswitch == "Public" ? pub = true : pub = false;

  if (snippet.github){
    githubname = snippet.github.username;
    githubURL = snippet.github.url;
  }else{
    githubname =  "";
    githubURL =  "";
  }



  var query = {"_id": snippetid};
  var update = {"name": snippet.name, "content": snippet.content, "info": snippet.info, "tags": snippet.tags, "language" : snippet.language, "public": pub, "github": {username: githubname, url: githubURL}};


  Snippet.findOneAndUpdate(query, update, function(err, edit) {
    if (err) {
      console.log('got an error');
    }
    indexUpdatedSnippet(snippetid);
    callback("success");
  });


}; // saveEditedSnippet ende

function indexUpdatedSnippet(snippetid){
  Snippet.findOne({_id: snippetid}, function(err, result) {
    if(err){
      console.log(err);
    }
    console.log("inside findOne");
    result.index(function(err, res){
      if(err){
        console.log(err);
      }
      console.log("res: "+res);
    });
  });
}

/* =======================================
    REMOVE SNIPPET
   ======================================= */
exports.deleteSnippet = function(snippetid, callback) {

  Snippet.findByIdAndRemove(snippetid, function(err, del){
    if (err) {
      console.log('got an error');
    }
    callback("success");
  });

};



/* =======================================
    GET SNIPPET BY ID
   ======================================= */

exports.getSnippet = function(snipnum, callback) {

var snippetFilter = {
  "bool": {
     "must": {"term": {"_id": snipnum}}
  }
}


Snippet.search(snippetFilter, {hydrate:true, hydrateOptions: {lean: false}}, function(err, searchresult) {
    if(err){
      callback(null, err);
    } else {
      // console.log(searchresult.hits.hits);
      callback(searchresult.hits.hits, null);
    }
  });
};



/* =======================================
    GET SNIPPETS BY USER ID
   ======================================= */
exports.getSnippetForUser = function(id, callback) {

var userFilter = {
  "bool": {
     "must": [
          {
            "term": {"public": true}
          },
          {
            "match": {"creator": id}
          }
        ],
     "must_not": { "term": { "public": false }}
  }
}


Snippet.search(userFilter, {from: 0, size: 100, hydrate:true, hydrateOptions: {lean: true}}, function(err, searchresult) {
      if(err){
        console.log(err);
      }
      callback(searchresult.hits.hits, null);
    });
};

/* =======================================
    GET SNIPPETS BY USER ID
   ======================================= */

exports.getPrivateSnippetForUser = function(id, callback) {

var userPrivFilter = {
  "bool": {
     "must": [
          {
            "term": {"public": false}
          },
          {
            "match": {"creator": id}
          }
        ],
     "must_not": { "term": { "public": true }}
  }
};


Snippet.search(userPrivFilter, {hydrate:true, hydrateOptions: {lean: true}}, function(err, searchresult) {
    if(err){
      callback(null, err);
    } else {
      callback(searchresult.hits.hits, null);
    }
  });
};



/* =======================================
    SEARCH SNIPPETS
   ======================================= */

exports.findSnippet = function(search, callback) {

 var publicFilter = {
  "bool": {
     "must": [{
          "term": { "public": true}},
        {
        "multi_match" : {
          "query": search,
          "type": "best_fields",
          "fields": ["name", "language", "tags", "info"],
          "minimum_should_match": "25%",
          "fuzziness" : 2,
        }
      }],
     "must_not": { "term": { "public": false }}
  }
}


  Snippet.search(publicFilter, {hydrate:true, hydrateOptions: {lean: true}}, function(err, searchresult) {
    if(err){
      console.log(err);
      callback(null, err);
    } else {
      callback(searchresult.hits.hits, null);
    }
  });


};


/* =======================================
    SEARCH SNIPPETS FOR USER
   ======================================= */

exports.findSnippetByUser = function(search, userid, callback) {

var byUserFilter = {
  "bool": {
     "must": [
        {"term": {"public": true}},
        {"match": {"creator": userid}},
      {
        "multi_match" : {
          "query": search,
          "type": "best_fields",
          "fields": ["name", "language", "tags", "info"],
          "minimum_should_match": "25%",
          "fuzziness" : 2,
        }
      }],
     "must_not": { "term": { "public": false }}
  }
}

  Snippet.search(byUserFilter, {hydrate:true, hydrateOptions: {lean: true}}, function(err, searchresult) {
    if(err){
      console.log(err);
      callback(null, err);
    } else {
      if(err){
        console.log(err);
      }
      // console.log(searchresult);
      callback(searchresult.hits.hits, null);
    }

  });

};


exports.findPrivateSnippetByUser = function(search, userid,callback) {


var userPrivFilter = {
  "bool": {
     "must": [
        {"term": {"public": false}},
        {"match": {"creator": userid}},
      {
        "multi_match" : {
          "query": search,
          "type": "best_fields",
          "fields": ["name", "language", "tags", "info"],
          "minimum_should_match": "25%",
          "fuzziness" : 2,
        }
      }],
     "must_not": { "term": { "public": true }}
  }
}


Snippet.search(userPrivFilter, {hydrate:true, hydrateOptions: {lean: true}}, function(err, searchresult) {
    if(err){
      console.log(err);
      callback(null, err);
    } else {
      if(err){
        console.log(err);
      }
      callback(searchresult.hits.hits, null);
    }

  });
};

/* =======================================
    SEARCH SNIPPET IN LIST
   ======================================= */
/*
* Finding a snippet in a list, based on searchterm
*/
exports.findSnippetsInList = function(listID, search, callback) {

var snippetInListFilter = {
  "bool": {
     "must": [
        {"term": {"public": true}},
        {"match": {"inlist": listID}},
      {
        "multi_match" : {
          "query": search,
          "type": "best_fields",
          "fields": ["name", "language", "tags", "info"],
          "minimum_should_match": "25%",
          "fuzziness" : 2,
        }
      }],
     "must_not": { "term": { "public": false }}
  }
}


Snippet.search(snippetInListFilter, {hydrate:true, hydrateOptions: {lean: false}}, function(err, searchresult) {
    if(err){
      console.log(err);
    }
    if(searchresult != undefined){
      callback(searchresult.hits.hits, null);
    }
  });
};



/* =======================================
    UPVOTE SNIPPET
   ======================================= */

exports.upvoteSnippet = function(givenid, callback) {

  var query = {"_id": givenid};
  var update = {$inc: {upvotes: 1}};

  Snippet.findOneAndUpdate(query, update, function(err, upvote) {
    if (err) {
      console.log('got an error');
    }
    callback("success");
  });
};


/* =======================================
    DOWNVOTE SNIPPET
   ======================================= */

exports.downvoteSnippet = function(givenid, callback) {

  var query = {"_id": givenid};
  var update = {$inc: {upvotes: -1}};

  Snippet.findOneAndUpdate(query, update, function(err, upvote) {
    if (err) {
      console.log('got an error');
    }
    callback("success");
  });
};



/* =======================================
    COUNT ALL SNIPPETS
   ======================================= */

exports.countSnippets = function(callback) {
 Snippet.count({}, function(err, count){
    callback(count);
  });
};


/* =======================================
    COUNT ALL VOTES
   ======================================= */

exports.countVotes = function(callback) {
 Snippet.find({}).exec(function(err, fullCollection) {

    var upvotes = 0;
    fullCollection.forEach(function(snippet, index){
      if(snippet.upvotes){
        upvotes = upvotes + snippet.upvotes;
      }
    });

    callback(upvotes);
  });
};

/* =======================================
    COUNT ALL LISTS
   ======================================= */

exports.countLists = function(callback) {
 List.count({}, function(err, count){
    callback(count);
  });
};



/* =======================================
    DOES SNIPPET HAVE GIHUB URL
   ======================================= */
exports.snippetHasGithubURL = function(githubURL, callback) {

var snippetFilter = {
  "bool": {
     "must": {"match": {"github.url": githubURL}}
  }
}

Snippet.search(snippetFilter, {hydrate:true, hydrateOptions: {lean: false}}, function(err, searchresult) {
    if(err){
      console.log(err);
    }

    if(searchresult.hits.hits.length > 0){
      callback(true, null);
    }else{
      callback(false, null);
    }

  });
};


/* =======================================
    GET SNIPPET BY GIHUB URL
   ======================================= */
exports.getSnippetByGithubURL = function(githubURL, callback) {

var snippetFilter = {
  "bool": {
     "must": {"match": {"github.url": githubURL}}
  }
}

Snippet.search(snippetFilter, {hydrate:true, hydrateOptions: {lean: false}}, function(err, searchresult) {
    if(err){
      console.log(err);
    }
    callback(searchresult.hits.hits, null);
  });
};




/* =======================================
    IMPORT GISTS FROM GITHUB
   ======================================= */
exports.importFromGithub = function(githubusername, password, userid, callback) {

  var github = new GitHubApi({
    version: "3.0.0",
    timeout: 20000
  });

  github.authenticate({
    type: "basic",
    username: githubusername,
    password: password
  });

  github.gists.getFromUser({
      user: githubusername
    }, function(err, res) {
      if(err){
        console.log(err);
      }

      async.forEach(res, function (item, callback){
        github.gists.get({
          id: item.id
        }, function(err, res) {
          saveOrUpdateSnippet(githubusername, password, userid, err, res, callback);
        }); // ende get gists

        console.log("1 snippet processed");

      },function(err){
        if(err){
          console.log(err);
        }
        return callback(res.length + " gists imported", null);
      }); // ende async

  });
};




function saveOrUpdateSnippet(githubusername, password, userid, err, res, callback){
    if(err){
    console.log(err);
  }

  var name = Object.keys(res.files)[0],
      language = Object.keys(res.files)[2],
      content = res.files[name].content,
      info = res.description,
      isPublic = res.public,
      githubURL = res.html_url,
      githubName = res.owner.login;

      if(language == null) language = "Text";

      var pub;
      if(isPublic){
        pub = "Public";
      }else{
        pub = "Private";
      }


  var newSnippet = {
      name: name,
      content: content,
      info: info,
      tags: "",
      creator: userid,
      upvotes: 0,
      onoffswitch: pub,
      language: language,
      github: {username: githubName, url: githubURL}
  };

  snippetWorker.snippetHasGithubURL(githubURL, function(snippetWithURLexists, err){
    if(err){
      console.log(err);
    }
    // snippet has been imported before
    if(snippetWithURLexists){
      snippetWorker.getSnippetByGithubURL(githubURL, function(searchresult, err){
        snippetWorker.saveEditedSnippet(searchresult[0].id, newSnippet, function(success, err) {
          if(err){
            console.log(err);
          }
        });
      });

    }else{
      console.log("new snippet is being saved");
      snippetWorker.addSnippet(newSnippet, userid, function(err, res){
        if(err){
          console.log(err);
        }
        console.log(res);
      });
   } // end else
  });

callback("Import done");
}






/* =======================================
    GET MOST POPULAR SNIPPETS (MOST VOTES)
   ======================================= */
exports.popularSnippets = function(callback) {
  Snippet.find({public:true, creator: { $ne: "0" }}).sort('-created').limit(12).exec(function(err, orderedCollecion) {
    callback(orderedCollecion);
  });
}


/* =======================================
    GET MOST RECENT SNIPPETS
   ======================================= */
exports.recentSnippets = function(callback) {
  Snippet.find({public:true, creator: { $ne: "0" }}).sort('-created').limit(15).exec(function(err, orderedCollecion) {
    callback(orderedCollecion);
  });
}

/* ======================================= */

exports.recentPagedSnippets = function(pageid, count, callback) {

  var fromcount = parseInt(pageid)*15;

  Snippet.find({public:true, creator: { $ne: "0" }}).sort('-created').skip(fromcount).limit(15).exec(function(err, orderedCollecion) {
    callback(orderedCollecion);
  });

}





