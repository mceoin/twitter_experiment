var OAuth = require('OAuth');
var oauth = new OAuth.OAuth(
  'https://api.twitter.com/oauth/request_token',
  'https://api.twitter.com/oauth/access_token',
  'key',
  'key',
  '1.0A',
  null,
  'HMAC-SHA1'
);

module.exports.oauth = oauth;