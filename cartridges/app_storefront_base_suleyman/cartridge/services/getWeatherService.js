'use strict';

/**

 * Initialize HTTP services for a cartridge

 */

var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');

var getWeatherAPIService = LocalServiceRegistry.createService('app_storefront_base_suleyman.getWeather', {
    createRequest: function (svc, params) {
        svc.setRequestMethod('GET');
        svc.addHeader('Accept', 'application/json');
        return params;
    },

    parseResponse: function (svc, httpClient) {
        var result;
        try {
            result = JSON.parse(httpClient.text);
        } catch (e) {

            result = httpClient.text;
        }
        return result;
    },

    filterLogMessage: function (msg) {

        return msg;
    }
});

module.exports = {
    getWeatherAPIService: getWeatherAPIService
}