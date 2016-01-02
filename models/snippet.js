var mongoose = require('mongoose');
var mongoosastic = require('mongoosastic');
var Schema = mongoose.Schema;
var shortid = require('shortid');

var snippetSchema = new Schema({
  _id: {type: String, index: { unique: true } ,'default': shortid.generate},
  name: {type: String, es_indexed:true},
  creator: {type: String, index: true, required: true, es_indexed:true},
  content: {type: String, required: 'Please enter the code you want to save as a snippet.'},
  info: {type: String, es_indexed:true},
  tags: {type: String, es_indexed:true},
  created: {type: Date, default: Date.now},
  upvotes: Number,
  public: {type: Boolean, default: true, es_indexed:true},
  inlist: { type : Array , "default" : [], index: true, es_type:'string', es_indexed:true},
  language: {type: String, default: "undef", es_indexed:true},
  github: {
    username: String,
    url: {type: String, default: "", es_indexed:true}
  },
  link: {type: String, es_indexed:true, default: ""}
});


snippetSchema.plugin(mongoosastic);
var Snippet = mongoose.model('Snippet', snippetSchema);


Snippet.createMapping(function(err, mapping){
  if(err){
    console.log('error creating mapping (you can safely ignore this)');
    console.log(err);
  }else{
    console.log('elasticsearch Snippets connected.');
    console.log(mapping);
  }
});

module.exports = {
  Snippet: Snippet
};