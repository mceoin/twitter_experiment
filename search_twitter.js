// NOTE TO SELF: is this paginating correctly? I seem to only be getting one response back //
// NOTE TO SELF: NEED TO DEDUPE USERS;

/* Start DB Code */
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var mongoUrl = 'mongodb://localhost:27017/twitterz';

var insertDocument = function(db, data, query, callback) {
  var user_count = data.length;
  var users = data;
  db.collection('twitter_search_2').insertOne({
    query: query,
    user_count : user_count,
    users : users,
  }, function(err, result) {
    assert.equal(err, null);
    console.log("Inserted a document into the twitter_search collection.");
    callback();
  });
};

var extract_users = function(data, arr){
  for (var i = 0, len = data.length; i < len; i++) {
    arr.push(data[i].user);
  }
  return arr;
};

var writeToDB = function(data, query){
  MongoClient.connect(mongoUrl, data, function(err, db) {
    assert.equal(null, err);
    insertDocument(db, data, query, function() {
      db.close();
    });
  }); 
};

function saveRequest(err, searchRequest) {
  if (err) return console.log('Failed', err, searchRequest);

  console.log('saving', searchRequest.results.length, 'users for', searchRequest.q);
  var users = [];
  extract_users(searchRequest.results, users);
  writeToDB(users, searchRequest.q);
}

/* End DB Code */

/* Start Twitter API code */
var twitter = require('./oauthFile.js');

function searchTwitter(err, searchRequest, {count,max_id}, i) {
  if (err) return searchRequest(err, searchRequest)
  i = i+1;
  console.log('searchTwitter', i, 'for searchRequest', searchRequest.q);

  var url = 'https://api.twitter.com/1.1/search/tweets.json?';
  url += `q=${searchRequest.q}&count=${count}`;
  if (max_id) url += `&max_id=${max_id}`
  console.log(url)

  twitter.oauth.get(
    url,
    '19323665-fmbAHAtoGUzmTT7rlJ0tWvaZyw7OLx2JeXHv9P6jQ', 
    'si35IUgSUNq4FGsW8EniW5GGQEpOPrBbNaxqYz8JL6k5X', 
    // this function is invoked inside twitter nodejs code async
    function(e, data, res) {  
      if (e) searchRequest(e, searchRequest); //broken

      if (data !== undefined) {
        var parsedData = JSON.parse(data);      
      };
      var statuses = parsedData["statuses"];
      var search_metadata = parsedData["search_metadata"];
      console.log(search_metadata);

      var done = function(){
      	if ((parsedData === undefined)
      		|| (statuses === undefined)
        	|| (i > 1 && statuses[0] === undefined) 
        	|| (statuses[0].id === statuses[statuses.length-1].id)) {
          return true
        }
      }

      if (done())
        return saveRequest(null, searchRequest);

      searchRequest.results = searchRequest.results.concat(statuses);
      max_id = statuses[statuses.length-1].id;
      console.log(max_id, 'max_id');
      searchTwitter(null, searchRequest, {count,max_id}, i);
    }
  );
};

encoded_q = encodeURIComponent('linkedin.com/pulse/human-rights-women-entrepreneurs-reid-hoffman');
var searchRequest = {q:encoded_q,results:[]};
var opts = {count:100,max_id:null};

searchTwitter(null, searchRequest, opts, 0);

