var List = require('../models/list').List;
var Snippet = require('../models/snippet').Snippet;
var mongoosastic = require('mongoosastic');
var async = require('async');

/* =======================================
    CREATE LIST
   ======================================= */

exports.createList = function(list, userid, callback) {

  // var snippetid = list.listid;
  var pub;
  list.onoffswitch == "Public" ? pub = true : pub = false;

   var newList = new List({
        name: list.listname,
        info: list.listinfo,
        tags: list.tags,
        creator: userid,
        upvotes: 0,
        public: pub
      });

   newList.save(function(err) {
    if (err) {
        return callback(err);
      }
      callback(newList.id, null);


    });

}; // addSnippet ende




/* =======================================
    REMOVE LIST
   ======================================= */
exports.deleteList = function(listid, callback) {
  List.findByIdAndRemove(listid, function(err, del){
    if (err) {
      console.log('got an error');
    }
    callback("success");
  });
};

/* =======================================
    REMOVE SNIPPET FROM LIST
   ======================================= */
exports.deleteSnippetFomList = function(listid, snippetid, callback) {

  Snippet.update({_id: snippetid}, {$pull:{inlist: listid}}, function(err, deleted){
    if(err){
      console.log(err);
    }
    callback("success");

    Snippet.findOne({_id: snippetid}, function(err, result) {
      if(err){
        console.log(err);
      }
      result.index(function(err ,res){
        if(err){
          console.log(err);
        }
      });
    });

  });
};



/* =======================================
    GARBAGE COLLECTOR
   ======================================= */
exports.garbageCollector = function(listid, callback) {

  var snippetInListFilter = {
    "bool": {
      "must": {"match": {"inlist": listid}},
    }
  }

  Snippet.update({inlist: listid}, {$pull:{inlist: listid}}, function(err, deleted){
    if(err){
      console.log(err);
    }
    callback("success", null);

  });
};




/* =======================================
    ADD SNIPPET TO LIST
   ======================================= */

exports.addToList = function(snippetid, listid, callback) {

    Snippet.find({_id: snippetid}, function(err, snippet) {
    var inlist = snippet[0].inlist;

    if(inlist.indexOf(listid) > -1){ // already in list

        callback("This Snippet is already in your list.", null);

    } else { // not in list => add

      Snippet.findOneAndUpdate( { _id: snippetid }, {$push:{inlist: listid}}, function(err, result) {
        if(err){
          console.log(err);
          callback(null, err);
        }

          Snippet.findOne({_id: snippetid}, function(err, result) {
            result.index(function(err, res){
              if(err){
                console.log(err);
              }

            });
          });

          callback("Snippet has been added to your list.", null);

      });


    } // else
  });
};



/* =======================================
    COUNT ALL LISTS
   ======================================= */

exports.countLists = function(callback) {
 List.count({}, function( err, count){
    callback(count);
  });
};



/* =======================================
    GET LIST BY ID
   ======================================= */

exports.getList = function(listid, callback) {

  var listFilter = {
    "bool": {
       "must": {"term": {"_id": listid}}
    }
  }

  List.search(listFilter, {hydrate:true, hydrateOptions: {lean: false}}, function(err, list) {
    if(err){
      console.log(err);
      callback(null, err);
    } else {
      callback(list.hits.hits, null);
    }

  });
};


/* =======================================
    GET LISTS BY USER ID
   ======================================= */


exports.getListsForUser = function(id, callback) {


var userListPubFilter = {
  "bool": {
     "must": [
        {"term": {"public": true}},
        {"match": {"creator": id}}
      ],
     "must_not": { "term": { "public": false }}
  }
};


List.search(userListPubFilter, {hydrate:true, hydrateOptions: {lean: false}}, function(err, searchresult) {
    if(err){
      console.log(err);
      callback(err, null);
    } else {
      callback(searchresult.hits.hits, null);
    }
  });
};

/* =======================================
    GET PRIVATE LISTS BY USER ID
   ======================================= */

exports.getPrivateListsForUser = function(id, callback) {

var userPrivFilter = {
  "bool": {
     "must": [
        {"term": {"public": false}},
        {"match": {"creator": id}}
      ],
     "must_not": { "term": { "public": true }}
  }
};


List.search(userPrivFilter, {hydrate:true, hydrateOptions: {lean: true}}, function(err, searchresult) {
    if(err){
      console.log(err);
      callback(null, err);
    } else {
      callback(searchresult.hits.hits, null);
    }
  });
};



/* =======================================
    GET LISTS BY NAME (SEARCH)
   ======================================= */
exports.findList = function(search, callback) {

var findListFilter = {
  "bool": {
     "must": [
        {"term": {"public": true}},
      {
        "multi_match" : {
          "query": search,
          "type": "best_fields",
          "fields": ["name", "info"],
          "minimum_should_match": "50%",
          "fuzziness" : 2,
        }
      }],
     "must_not": { "term": { "public": false }}
  }
}


List.search(findListFilter, {hydrate:true, hydrateOptions: {lean: false}}, function(err, searchresult) {
    if(err){
      console.log(err);
      callback(null, err);
    } else {
      callback(searchresult.hits.hits, null);
    }

  });
};




/* =======================================
    SEARCH LISTS WITH TERM AND USER ID
   ======================================= */
exports.findListByUser = function(search, userid, callback) {
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

  List.search(byUserFilter, {hydrate:true, hydrateOptions: {lean: true}}, function(err, searchresult) {
    if(err){
      console.log(err);
    } else {
      if(err){
        console.log(err);
      }
      callback(searchresult.hits.hits, null);
    }
  });
};


/* =======================================
    SEARCH _PRIVATE_ LISTS WITH TERM AND USER ID
   ======================================= */
exports.findListByUser = function(search, userid, callback) {
var byUserFilter = {
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

  List.search(byUserFilter, {hydrate:true, hydrateOptions: {lean: true}}, function(err, searchresult) {
    if(err){
      console.log(err);
    } else {
      if(err){
        console.log(err);
      }
      callback(searchresult.hits.hits, null);
    }
  });
};





/* =======================================
    GET SNIPPETS IN LIST
   ======================================= */

exports.getSnippetsInList = function(listID, callback) {

  var snippetFilter = {
    "bool": {
       "must": {
        "match": {"inlist": listID}
      }
    }
  }

  Snippet.search(snippetFilter, {hydrate:true, hydrateOptions: {lean: false}}, function(err, searchresult) {
    if(err){
      console.log(err);
    } else {
      callback(searchresult.hits.hits, null);
    }
  });


};



/* =======================================
    GET MOST RECENT LISTS
   ======================================= */
exports.recentLists = function(callback) {
   var pubFilter = {
  "bool": {
     "must": [
          {
            "term": {"public": true}
          }
        ],
     "must_not": { "term": { "public": false }}
  }
}


List.search(pubFilter, {hydrate:true, hydrateOptions: {lean: true}}, function(err, searchresult) {
    if(err){
      callback(null, err);
    } else {
      if(err){
        console.log(err);
      }
      callback(searchresult.hits.hits, null);
    }
  });
}

// exports.recentLists = function(callback) {
//   List.find({}).sort('-created').limit(15).exec(function(err, orderedCollecion) {
//     callback(orderedCollecion);
//   });
// }

/* ======================================= */

exports.recentPagedLists = function(pageid, count, callback) {

  var fromcount = parseInt(pageid)*15;

  List.find({public:true, creator: { $ne: "0" }}).sort('-created').skip(fromcount).limit(15).exec(function(err, orderedCollecion) {
    callback(orderedCollecion);
  });


}

