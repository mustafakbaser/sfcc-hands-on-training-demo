'use strict';

/**
 * Unzip files from local archive(s) to a local directory
 *
 * Job Parameters:
 *
 *   SourceFolder: String The local folder where to find files to unzip.
 *   FilePattern: String Input File pattern to search in source folder (default is  "^[\\w\-]{1,}\\.xml$" (*.xml)).
 *   TargetFolder: String The local folder in which will unzipped the archive, relatively to IMPEX/.
 *   UseArchiveNameAsFolder: Boolean If set to true, the archive name will be appended to the TargetFolder parameter and the files in the archive will be uncompressed in there.
 *   NoFileFoundStatus: String The status to fire when no files are found in the local directory.
 */

var File = require('dw/io/File');
var Status = require('dw/system/Status');

var FileHelper = require('~/cartridge/scripts/file/FileHelper');
var StepUtil = require('~/cartridge/scripts/util/StepUtil');

/**
 * The main function.
 *
 * @returns {dw.system.Status} The exit status for the job step
 */
var run = function run() {
    var args = arguments[0];

    if (StepUtil.isDisabled(args)) {
        return new Status(Status.OK, 'OK', 'Step disabled, skip it...');
    }

    // Load input Parameters
    var filePattern = args.FilePattern;
    var noFilesFoundStatus = args.NoFileFoundStatus;
    var useArchiveNameAsFolder = args.UseArchiveNameAsFolder;
    var removeArchivesAfterCompletion = args.RemoveArchivesAfterCompletion;
    var sourceFolder = StepUtil.replacePathPlaceholders(args.SourceFolder);
    var targetFolder = StepUtil.replacePathPlaceholders(args.TargetFolder);

    // Test mandatory parameters
    if (empty(sourceFolder) || empty(targetFolder)) {
        return new Status(Status.ERROR, 'ERROR', 'One or more mandatory parameters are missing.');
    }

    var sourceDirStr = File.IMPEX + (sourceFolder.charAt(0).equals(File.SEPARATOR) ? sourceFolder + File.SEPARATOR : File.SEPARATOR + sourceFolder);
    var fileList = FileHelper.getFiles(sourceDirStr, filePattern);
    if (fileList.length === 0) {
        switch (noFilesFoundStatus) {
        case 'ERROR':
            return new Status(Status.ERROR, 'ERROR', 'No files to uncompress.');
        default:
            return new Status(Status.OK, 'NO_FILE_FOUND', 'No files to uncompress.');
        }
    }

    // Un-compress files
    if (!FileHelper.unzipFiles(fileList, targetFolder, useArchiveNameAsFolder, removeArchivesAfterCompletion)) {
        return new Status(Status.ERROR, 'ERROR', 'An error occurred while uncompressing files.');
    }

    return new Status(Status.OK, 'OK', 'Files successfully uncompressed.');
};

exports.Run = run;
