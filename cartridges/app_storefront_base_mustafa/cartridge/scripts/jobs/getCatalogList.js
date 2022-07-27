'use strict'

function getFileList() {
    var File = require( 'dw/io/File' );
    var IMPEXPath = File.IMPEX + File.SEPARATOR + 'src' + File.SEPARATOR + 'catalog' + File.SEPARATOR;
    var IMPEXDir = new File(IMPEXPath);
    var fileList = IMPEXDir.listFiles();
    return fileList
}

exports.getFileList = getFileList;
