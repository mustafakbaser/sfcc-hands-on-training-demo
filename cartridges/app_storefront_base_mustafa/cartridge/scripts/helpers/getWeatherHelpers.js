'use strict';


function getWeather(lat, lon) {
  var getWeatherService = require('*/cartridge/services/getWeatherService.js');
  var latitude = lat;
  var longitude = lon;
  var appid = '10ac5b50842d9efa6d8863a1346592ef';
  var url = getWeatherService.getWeatherAPIService.getURL();

  var svcResult = getWeatherService.getWeatherAPIService.setURL(url).addParam('lat', latitude).addParam('lon', longitude).addParam('appid', appid).addParam('units', 'metric').call();
  var temp = svcResult.object.main.temp;

  return temp;

}

module.exports = {
  getWeather: getWeather
};