var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var mongoUrl = 'mongodb://localhost:27017/twitterz';

// var getAllUsers = function(){
//   MongoClient.connect(mongoUrl, function(err, db) {
//     assert.equal(null, err);

//     db.collection('twitter_search', function(err, collection) {
//     	collection.find().toArray(function(err, result) {
//         if(err) throw err;    
//         var users = result[0].users;            
//         for (var i = 0, len = users.length; i < len; i++) {
//         	var user = users[i]
// 			    console.log(user.screen_name, user.id);
// 			  }

//      		db.close();
//       });
//     })
//   }); 
// };

// getAllUsers();

var urlCount = 0;
var all_urls = [];

var count = function(arr) {
	arr.sort();

  var current = null;
  var cnt = 0;
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] != current) {
      if (cnt > 2) {
          console.log('['+cnt + ', ' + `current` + '],');
      }
      current = arr[i];
      cnt = 1;
    } else {
      cnt++;
    }
  }
  if (cnt > 2) {
      console.log(cnt + ': ' + current);
  }
}

var getAllTweets = function(){
  MongoClient.connect(mongoUrl, function(err, db) {
    assert.equal(null, err);

    db.collection('user_tweets', function(err, collection) {
    	collection.find().toArray(function(err, result) {
        if(err) throw err;    
        for (var i = 0; i < result.length; i++) {
        	var batch = result[i];
        	all_urls = all_urls.concat(batch.urls);        	
        	urlCount = urlCount + batch.urls.length;
        }       
				if (urlCount === 11619) { //TODO: fix this manual approach
					count(all_urls);
				}
     		db.close();
      });
    })
  }); 
  count(all_urls);
};

getAllTweets();
