'use strict';
​
/**
 * Initialize HTTP services for a cartridge
 */

//var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
/*
var catalogExportList = LocalServiceRegistry.createService('app_storefront_base_suleyman.sftp.exportCatalog.get', {
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
*/

/**
 * @param {string} serviceID
 * @returns {dw.svc.FTPService}
 */
 function registerSFTP(serviceID) {
    var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
    return LocalServiceRegistry.createService(serviceID, {
        /**
         * @param {dw.svc.FTPService} svc
         * @param {Object} params
         */
        createRequest: function (svc, params) {
            var x = 0;
            svc.setOperation('putBinary', params.targetPath + params.fileName, params.exportFile);
            var y = 0;
        },
        parseResponse: function (svc, uploadStatus) {
            return uploadStatus;
        },
        mockCall: function (svc, params) {}
    });
}



/*
var catalogExportList = LocalServiceRegistry.createService('app_storefront_base_suleyman.sftp.exportCatalog.get', {
    createRequest: function(svc, res) {
        svc.setRequestMethod('GET');
        svc.addHeader('Accept', 'application/json');
        return res;
    },
    parseResponse: function (svc, res) {
        return res;
    },
    filterLogMessage: function (msg) {
        return msg.replace('headers', 'OFFWITHTHEHEADERS');
    },
    getRequestLogMessage: function (req) {
        return !empty(req) ? req.toString() : 'Request is null.';
    },
    getResponseLogMessage: function (response) {
        return !empty(response) ? response.toString() : 'Response is null.';
    }
});
*/

module.exports = {
    //catalogExportList: catalogExportList,
    registerSFTP: registerSFTP,
}