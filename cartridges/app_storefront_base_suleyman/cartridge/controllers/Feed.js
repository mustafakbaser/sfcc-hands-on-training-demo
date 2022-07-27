'use static';

/**
 * @namespace Feed
 */

var userLoggedIn = require('*/cartridge/scripts/middleware/userLoggedIn')
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');
// var cache = require('*/cartridge/scripts/middleware/cache');
// var pageMetaData = require('*/cartridge/scripts/middleware/pageMetaData');

var server = require('server');
var apiKey = '';
var locale = '';

// server.get('Products-Old', function (req, res, next) {
//   var System = require('dw/system');
//   var site = System.Site.getCurrent();
//   var productFeedApiKey = site.getCustomPreferenceValue('productFeedApiKey');

//   var apiKey = req.querystring.apiKey;
//   if (apiKey !== productFeedApiKey) {
//     res.json({
//       status: 401,
//       error: 'Api Key not match.'
//     });
//     next();
//   }

//   var locale = req.querystring.locale;


//   res.page("search/searchResults");

//   next();
// });

// Task 20
server.get('Products', userLoggedIn.validateLoggedIn, consentTracking.consent,
    function (req, res, next) {
        var Resource = require('dw/web/Resource');
        var URLUtils = require('dw/web/URLUtils');
        var System = require('dw/system');
        var site = System.Site.getCurrent();
        var productFeedApiKey = site.getCustomPreferenceValue('productFeedApiKey');
      
        var apiKey = req.querystring.apiKey;

        if (apiKey !== productFeedApiKey) {
            res.json({
              status: 401,
              error: 'API Key not match.'
            });
            next();
          }

        var locale = req.querystring.locale;

        try {
            var file = require('*/cartridge/scripts/jobs/getFeedCatalogList.js');
            var files = file.getFileList();
            var array = [];

            for (var i = 0; i < files.length; i++) {
                array.push(files[i].name);
            }

            res.render('feed/feedTemplate', {
                IMPEXPath: array,
                breadcrumbs: [
                    {
                        htmlValue: Resource.msg('global.home', 'common', null),
                        url: URLUtils.home().toString()
                    }
                ]
            });
        } catch (error) {
            res.status(401)
        }
        next();
    });

module.exports = server.exports();
