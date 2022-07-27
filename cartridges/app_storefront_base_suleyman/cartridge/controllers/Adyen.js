'use strict';

var server = require('server');

server.get('Notify', function (req, res, next) {
  res.json({
    geldi: 'Geldi'
  });

  next();
})

module.exports = server.exports();