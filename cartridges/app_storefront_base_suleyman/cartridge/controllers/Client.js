use strict';

/**
 * @namespace ContactUs
 */

var server = require('server');

server.get('users', function (req, res, next) {
  var reqResApiService = require('*/cartridge/services/getReqResService.js');
  var URLUtils = require('dw/web/URLUtils');
  var svcResult = reqResApiService.reqResApiService.call();


  if (svcResult.status === 'OK') {
    res.render('client/clientList.isml', {
      svcResult: svcResult.object.data
    });
  }
  next();
})

module.exports = server.exports();
