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
        // var httpClient = new HTTPClient();

        
        // httpClient.get('GET', 'https://zzkl-015.sandbox.us01.dx.commercecloud.salesforce.com/on/demandware.servlet/webdav/Sites/Impex/src/catalog/Task14.xml');
        // httpClient.setTimeout(3000);
        // httpClient.send();

        // if (httpClient.statusCode == 200)
        // {
        //     var message = httpClient.text;
        // }
        // else
        // {
        //     // error handling
        //     var message="An error occurred with status code "+httpClient.statusCode;
        // }

        // var http = new Http();
        
        // //var sfccwebdav = require('sfcc-webdav');
        // http.get("https://zzkl-015.sandbox.us01.dx.commercecloud.salesforce.com/on/demandware.servlet/webdav/Sites/Impex/src/catalog/Task14.xml",(res) => {
        //     // Image will be stored at this path
            
        //     const path = '*/cartridges/app_storefront_base_suleyman/cartridge/files/deneme.xml'; 
        //     const filePath = fs.createWriteStream(path);
        //     res.pipe(filePath);
        //     filePath.on('finish',() => {
        //         filePath.close();
        //         console.log('Download Completed'); 
        //     })
        // })

        //var SFTPClient = require('dw/net/SFTPClient');
        //SFTPClient.connect("zzkl-015.sandbox.us01.dx.commercecloud.salesforce.com");
        //SFTPClient.getBinary('/IMPEX/src/catalog/Task14.xml','*/cartridge/localFiles/Task14.xml')

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

    //
module.exports = server.exports();