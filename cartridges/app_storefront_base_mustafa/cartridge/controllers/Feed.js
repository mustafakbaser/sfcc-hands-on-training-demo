'use static';



var server = require('server');
var apiKey = '';
var locale = '';

server.get('Products', function (req, res, next) {
  var System = require('dw/system');
  var site = System.Site.getCurrent();
  var productFeedApiKey = site.getCustomPreferenceValue('productFeedApiKey');

  var apiKey = req.querystring.apiKey;
  if (apiKey !== productFeedApiKey) {
     res.json({
      status: 401,
      error: 'Api Key not match.'
    });
    next();
  }

  var locale = req.querystring.locale;


 
});


module.exports = server.exports();
