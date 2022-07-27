'use strict';

var List = require('dw/util/List');
var Status = require('dw/system/Status');
var Site = require('dw/system/Site');

var fileName;
var targetPath = '/';

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
            svc.setOperation('putBinary', targetPath + params.fileName, params.abc);
            var z = 0;
        },
        parseResponse: function (svc, uploadStatus) {
            return uploadStatus;
        },
        mockCall: function (svc, params) {}
    });
}

function sftpUpload(params, stepExecution) {
    /**
     * @type {dw.svc.FTPService}
     */
    var sftpService = registerSFTP(params.SFTPServiceID);
    var siteID = Site.current.ID;

    var File = require('dw/io/File');
    

    var directoryPath = new File(params.SourcePathName)
    var fileList = directoryPath.listFiles().toArray();
    var x = 0;

    var returnStatus;

    for(var i = 0; i < fileList.length; i++){
        fileName = fileList[i].name;

        try {
            var uploadStatus = sftpService.call(
                {
                    sourceFile: fileList[i],
                    fileName: fileName,
                    targetPath: targetPath
                }
                );
            if (uploadStatus.ok) {
                returnStatus = new Status(Status.OK);
            } else {
                returnStatus = new Status(Status.ERROR, uploadStatus.status, uploadStatus.errorMessage);
                var x = 0;
                
            }
        } catch (e) {
            returnStatus = new Status(Status.ERROR, 'EXCEPTION', e.toString());
        }
    }

    
    
    return returnStatus;
    
}

exports.sftpUpload = sftpUpload;