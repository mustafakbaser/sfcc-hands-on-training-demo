'use strict';

/**

 * Initialize HTTP services for a cartridge

 */

var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');

// Cartoon
var System = require('dw/system');
var site = System.Site.getCurrent();


var reqResApiService = LocalServiceRegistry.createService('app_storefront_base_suleyman.reqres.get', {
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
  reqResApiService: reqResApiService
}