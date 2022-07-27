'use strict';

/**
 * @namespace SFTP
 */

var server = require('server');

var userLoggedIn = require('*/cartridge/scripts/middleware/userLoggedIn')
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');
// var cache = require('*/cartridge/scripts/middleware/cache');
// var pageMetaData = require('*/cartridge/scripts/middleware/pageMetaData');

// Task 14
server.get('Show', userLoggedIn.validateLoggedIn, consentTracking.consent,
    function (req, res, next) {
        var Resource = require('dw/web/Resource');
        var URLUtils = require('dw/web/URLUtils');

        try {
            var file = require('*/cartridge/scripts/jobs/getCatalogList.js');
            var files = file.getFileList();
            var array = [];

            for (var i = 0; i < files.length; i++) {
                array.push(files[i].name);
            }

            res.render('sftp/sftpTemplate', {
                IMPEXPath: array,
                breadcrumbs: [
                    {
                        htmlValue: Resource.msg('global.home', 'common', null),
                        url: URLUtils.home().toString()
                    }
                ]
            });
        } catch (error) {
            res.status(404)
        }
        next();
    });

module.exports = server.exports();