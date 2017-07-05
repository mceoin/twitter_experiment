// PseudoCode:
// [x] authenticate with Twitter 
// [] Get a list of all users who have shared a given URL, "X"
// [] Get a list of all urls for each user who has also shared "X"
///// [x] From Tweets
//////// [x] Iterating though all
///// [] From Favorites - https://api.twitter.com/1.1/favorites/list.json
///// [] From ReTweets - 
// [] Move through Twitter's linked list of data for each user, pulling all links along the way
// [] Get a count for all URLs shared by people who also shared "X", in descending order

/* Start DB Code */
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var mongoUrl = 'mongodb://localhost:27017/twitterz';

var insertDocument = function(db, data, userId, callback) {
  db.collection('user_tweets').insertOne({
    user : data
  }, function(err, result) {
    assert.equal(err, null);
    console.log("Inserted a document into the user_tweets collection.");
    callback();
  });
};

var writeToDB = function(data, userId){
  MongoClient.connect(mongoUrl, data, function(err, db) {
    assert.equal(null, err);
    insertDocument(db, data, userId, function() {
      db.close();
    });
  }); 
}; 

var extract_urls = function(data, arr){
  for (var i = 0, len = data.length; i < len; i++) {
    const tweet_urls = data[i].entities.urls;
    if (tweet_urls.length){
      arr.push(tweet_urls[0].expanded_url);
    }
  }
  return arr
}

function saveUserData(err, user) {
  if (err) return console.log('Failed', err, user.user_id);

  var urls = [];
  extract_urls(user.timeline, urls);
  
  console.log('Success, saving: ', user.timeline.length, 'urls for', user.user_id);
  writeToDB(JSON.stringify(urls), user.user_id);
}

/* End DB Code */


/* Start Twitter API code */
var twitter = require('./oauthFile.js');

function getTimeline(err, user, {count,include_rts,max_id}, i) {
  if (err) return saveUserData(err, user)
  i = i+1;
  console.log('getTimeline', i, 'for user', user.user_id);

  var url = 'https://api.twitter.com/1.1/statuses/user_timeline.json?'
  url += `count=${count}&include_rts=false&user_id=${user.user_id}&screen_name=${user.screen_name}`;
  if (max_id) url += `&max_id=${max_id}`

  twitter.oauth.get(
    url,
    'KEY', 
    'KEY', 
    // this function is invoked inside twitter nodejs code async
    function(e, data, res) {  
      if (e) saveUserData(e, user);
      
      var parsedData = JSON.parse(data);      

      endOfTimeline = function(){
        if ((i > 1 && parsedData[0] === undefined) || (parsedData[0].id === parsedData[parsedData.length-1].id)) {
          return true
        }
        return false
      }

      if (endOfTimeline())
        return saveUserData(null, user);

      user.timeline = user.timeline.concat(parsedData);
      max_id = parsedData[parsedData.length-1].id;
      getTimeline(null, user, {count,include_rts,max_id}, i);
    }
  );

};


var opts = {count:200,include_rts:false,max_id:null};

var mceoin = {screen_name:'mceoin',user_id:'mceoin',timeline:[]};
var krez = {screen_name:'hackerpreneur',user_id:'hackerpreneur',timeline:[]};
var oscar = {screen_name:'Oscarthefarmer',user_id:'Oscarthefarmer',timeline:[]};

var users = [mceoin, krez, oscar];

getTimeline(null, users[0], opts, 0);
