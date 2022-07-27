'use strict';

/**
 * @namespace Faq
 */

var server = require('server');


server.get('Show', function (req, res, next) {
  var ContentMgr = require('dw/content/ContentMgr');
  var faqLibrary = ContentMgr.getFolder('FAQ_Library_Folder');

  var faqArray = [];
  for (let i = 0; i < faqLibrary.content.length; i++) {
    faqArray.push(faqLibrary.content[i].custom.body.markup);
  };

  var faqArrayLenght = faqArray.length;
  
  res.render('faq/faqHome', {
    faqArray: faqArray,
    faqArrayLenght: faqArrayLenght
  })
  next();
})

module.exports = server.exports();