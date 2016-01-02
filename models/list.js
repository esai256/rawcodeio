var mongoose = require('mongoose');
var mongoosastic = require('mongoosastic');
var Schema = mongoose.Schema;
var shortid = require('shortid');

var ListSchema = new Schema({
  _id: {type: String, index: { unique: true } ,'default': shortid.generate, es_indexed:true},
  name: {type: String, es_indexed:true},
  creator: {type: String, index: true, required: true, es_indexed:true},
  contributors: { type : Array , "default" : [], es_type:'string', es_indexed:true },
  info: {type: String, es_indexed:true},
  tags: String,
  created: {type: Date, default: Date.now},
  upvotes: Number,
  public: {type: Boolean, default: true, es_indexed:true}
});


ListSchema.plugin(mongoosastic);
var List = mongoose.model('List', ListSchema);

List.createMapping(function(err, mapping){  
  if(err){
    console.log('error creating mapping (you can safely ignore this)');
    console.log(err);
  }else{
    console.log('elasticsearch Lists connected.');
    console.log(mapping);
  }
});

module.exports = {
  List: List
};