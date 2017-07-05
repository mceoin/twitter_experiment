// PseudoCode:
// [x] authenticate with Twitter 
// [x] Get a list of all users who have shared a given URL, "X"
// [x] Get a list of all urls for each user who has also shared "X"
///// [x] From Tweets
//////// [x] Iterating though all tweets
// [x] Move through Twitter's linked list of data for each user, pulling all links along the way
// [] Get list of all tweets shared by users who have also shared "X"
// [] Get a count for all URLs shared by people who also shared "X", in descending order

/* Start DB Code */
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var mongoUrl = 'mongodb://localhost:27017/twitterz';

var insertDocument = function(db, data, userId, callback) {
  var url_count = data.length;
  db.collection('user_tweets').insertOne({
    user : userId,
    urls : data,
    url_count : url_count
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
    const extracted_urls = data[i].entities.urls;
    if (extracted_urls.length){
      arr.push(extracted_urls[0].expanded_url);
    }
  }
  return arr
}

function saveUserData(err, user) {
  if (err) return console.log('Failed', err, user.user_id);

  var urls = [];
  extract_urls(user.timeline, urls);

  console.log('Success, saving: ', user.timeline.length, 'urls for', user.user_id);
  writeToDB(urls, user.user_id);
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
    '19323665-fmbAHAtoGUzmTT7rlJ0tWvaZyw7OLx2JeXHv9P6jQ', 
    'si35IUgSUNq4FGsW8EniW5GGQEpOPrBbNaxqYz8JL6k5X', 
    // this function is invoked inside twitter nodejs code async
    function(e, data, res) {  
      if (e) saveUserData(e, user);
      
      if (data !== undefined) {
        var parsedData = JSON.parse(data);      
      }

      var done = function(){
        if ((parsedData === undefined) || (parsedData[0] === undefined) || (i > 1 && parsedData[0] === undefined) || (parsedData[0].id === parsedData[parsedData.length-1].id)) {
          return true
        }
      }

      if (done())
        return saveUserData(null, user);

      user.timeline = user.timeline.concat(parsedData);
      max_id = parsedData[parsedData.length-1].id;
      getTimeline(null, user, {count,include_rts,max_id}, i);
    }
  );

};


var opts = {count:200,include_rts:false,max_id:null};

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

// var mceoin = {screen_name:'mceoin',user_id:'mceoin',timeline:[]};
// var hackerpreneur = {screen_name:'hackerpreneur',user_id:'hackerpreneur',timeline:[]};
// var Oscarthefarmer = {screen_name:'Oscarthefarmer',user_id:'Oscarthefarmer',timeline:[]};
// var alyraz = {screen_name:'alyraz',user_id:'alyraz',timeline:[]};
// var naval = {screen_name:'naval',user_id:'naval',timeline:[]};
// var biz = {screen_name:'biz',user_id:'biz',timeline:[]};
// var ev = {screen_name:'ev',user_id:'ev',timeline:[]};
// var jack = {screen_name:'jack',user_id:'jack',timeline:[]};

// var users = [mceoin, hackerpreneur, Oscarthefarmer, alyraz, naval, biz, ev, jack];

var AdamSchweizer = {screen_name: 'AdamSchweizer',user_id:'216718524',timeline:[]};
var mwilcox = {screen_name: 'mwilcox',user_id:'8720422',timeline:[]};
var ajfirecracker = {screen_name: 'ajfirecracker',user_id:'52214252',timeline:[]};
var sidkal = {screen_name: 'sidkal',user_id:'1478818429',timeline:[]};
var maxlynch = {screen_name: 'maxlynch',user_id:'15103611',timeline:[]};
var viiiiiinnn = {screen_name: 'viiiiiinnn',user_id:'808873082500902900',timeline:[]};
var sundarnut = {screen_name: 'sundarnut',user_id:'19015881',timeline:[]};
var r9a2delta61 = {screen_name: 'r9a2delta61',user_id:'3075800797',timeline:[]};
var m_t_t_b = {screen_name: 'm_t_t_b',user_id:'171511513',timeline:[]};
var acityinohio = {screen_name: 'acityinohio',user_id:'84447535',timeline:[]};
var BITWETH_HQ = {screen_name: 'BITWETH_HQ',user_id:'861918355',timeline:[]};
var davidweisss = {screen_name: 'davidweisss',user_id:'19355816',timeline:[]};
var TheJustinWade = {screen_name: 'TheJustinWade',user_id:'2804175577',timeline:[]};
var BlocktechCEO = {screen_name: 'BlocktechCEO',user_id:'6661012',timeline:[]};
var Lum_Ramabaja = {screen_name: 'Lum_Ramabaja',user_id:'229567290',timeline:[]};
var Isx33I = {screen_name: 'Isx33I',user_id:'707526844103442400',timeline:[]};
var pii_ke = {screen_name: 'pii_ke',user_id:'117669992',timeline:[]};
var thomedes = {screen_name: 'thomedes',user_id:'374363087',timeline:[]};
var ganyet = {screen_name: 'ganyet',user_id:'4046891',timeline:[]};
var AleGuardia = {screen_name: 'AleGuardia',user_id:'166460777',timeline:[]};
var Shicority = {screen_name: 'Shicority',user_id:'3948781393',timeline:[]};
var viiiiiinnn = {screen_name: 'viiiiiinnn',user_id:'808873082500902900',timeline:[]};
var Arjuna_Kumbara = {screen_name: 'Arjuna_Kumbara',user_id:'2802126381',timeline:[]};
var sidviswanathan = {screen_name: 'sidviswanathan',user_id:'17869952',timeline:[]};
var landrew = {screen_name: 'landrew',user_id:'819217',timeline:[]};
var gpuliatti = {screen_name: 'gpuliatti',user_id:'630465792',timeline:[]};

var users = [
  AdamSchweizer,
  mwilcox,
  ajfirecracker,
  sidkal,
  maxlynch,
  viiiiiinnn,
  sundarnut,
  r9a2delta61,
  m_t_t_b,
  acityinohio,
  BITWETH_HQ,
  davidweisss,
  TheJustinWade,
  BlocktechCEO,
  Lum_Ramabaja,
  Isx33I,
  pii_ke,
  thomedes,
  ganyet,
  AleGuardia,
  Shicority,
  viiiiiinnn,
  Arjuna_Kumbara,
  sidviswanathan,
  landrew,
  gpuliatti,
]

//0 to 5

for(i = 23; i < 26; i++){
  getTimeline(null, users[i], opts, 0)
}
