'use strict';

/**
 * @namespace Home
 */

var server = require('server');
var cache = require('*/cartridge/scripts/middleware/cache');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');
var pageMetaData = require('*/cartridge/scripts/middleware/pageMetaData');

/**
 * Any customization on this endpoint, also requires update for Default-Start endpoint
 */
/**
 * Home-Show : This endpoint is called when a shopper navigates to the home page
 * @name Base/Home-Show
 * @function
 * @memberof Home
 * @param {middleware} - consentTracking.consent
 * @param {middleware} - cache.applyDefaultCache
 * @param {category} - non-sensitive
 * @param {renders} - isml
 * @param {serverfunction} - get
 */
server.get('Show', consentTracking.consent, cache.applyDefaultCache, function (req, res, next) {
    var Site = require('dw/system/Site');
    var PageMgr = require('dw/experience/PageMgr');
    var pageMetaHelper = require('*/cartridge/scripts/helpers/pageMetaHelper');
    var xkcdService = require('*/cartridge/services/getXkcdService.js')
    var getWeatherHelper = require('*/cartridge/scripts/helpers/getWeatherHelpers.js')
    pageMetaHelper.setPageMetaTags(req.pageMetaData, Site.current);
    var properties = {};
    var svcResult = xkcdService.xkcdAPIService.call();
    if (svcResult.status === 'OK') {
        properties.img = svcResult.object.img;
        properties.alt = svcResult.object.alt;
    }

    var temp = getWeatherHelper.getWeather(req.geolocation.latitude, req.geolocation.longitude)
    properties.temp = temp;
    var page = PageMgr.getPage('homepage');

    if (page && page.isVisible()) {
        res.page('homepage', properties);
    } else {
        res.render('home/homePage', properties);
    }
    next();
}, pageMetaData.computedPageMetaData);

server.get('ErrorNotFound', function (req, res, next) {
    res.setStatusCode(404);
    res.render('error/notFound');
    next();
});

server.get('getWeather', function (req, res, next) {

    var getWeatherService = require('*/cartridge/services/getWeatherService.js')

    var lat = req.geolocation.latitude;
    var lon = req.geolocation.longitude;
    var appid = '10ac5b50842d9efa6d8863a1346592ef';
    var url = getWeatherService.getWeatherAPIService.getURL();

    var svcResult = getWeatherService.getWeatherAPIService.setURL(url).addParam('lat', lat).addParam('lon', lon).addParam('appid', appid).addParam('units', 'metric').call();
    var temp = svcResult.object.main.temp;

    res.json({
        temp: temp
    });


});

module.exports = server.exports();