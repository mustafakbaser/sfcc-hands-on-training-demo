'use strict';

/**
 * @namespace ContactUs
 */

var server = require('server');

server.get('Show', function (req, res, next) {
  var URLUtils = require('dw/web/URLUtils');
  res.render('/clientForm/clientForm.isml', {
    actionUrl: URLUtils.url('ClientForm-Submit').toString(),
    states: ['United States of America', 'England', 'Germany', 'France', 'Turkey', 'New Zaeland']
  });
  next();
})

server.post('Submit', function (req, res, next) {
  var Transaction = require('dw/system/Transaction');
  var UUIDUtils = require('dw/util/UUIDUtils');
  var COMgr = require('dw/object/CustomObjectMgr');
  var URLUtils = require('dw/web/URLUtils');

  var form = req.form;
  Transaction.wrap(function () {
    var clientForm = COMgr.createCustomObject("clientForm", UUIDUtils.createUUID());
    clientForm.custom.name = form.clientFirstName;
    clientForm.custom.email = form.clientEmail;
    clientForm.custom.phone = form.clientPhone;
    clientForm.custom.country = form.state;
    clientForm.custom.city = form.clientCity;
    clientForm.custom.address = form.clientAddress;
  })

  res.redirect(URLUtils.url('ClientForm-Show').toString());
  next();
})

module.exports = server.exports();
