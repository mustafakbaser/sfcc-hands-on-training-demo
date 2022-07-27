'use strict';

/**

 * Initialize HTTP services for a cartridge

 */

var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');

// Cartoon
var System = require('dw/system');
var site = System.Site.getCurrent();
var customPreferenceValue = site.getCustomPreferenceValue('cartoonId');
var text = '';

var xkcdAPIService = LocalServiceRegistry.createService('app_storefront_base_suleyman.http.xkcd.get', {
    createRequest: function (svc, params) {

        text = svc.URL;
        svc.URL = text.replace('-', customPreferenceValue);
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
    xkcdAPIService: xkcdAPIService
}