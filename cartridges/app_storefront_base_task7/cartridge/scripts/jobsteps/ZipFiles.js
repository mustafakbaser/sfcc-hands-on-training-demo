'use strict';

/**
 * ZIP files from a local directory to a local archive
 *
 * Job Parameters:
 *
 *   SourceFolder: String The local folder where to find files to compress.
 *   FilePattern: String Input File pattern to search in source folder (default is  "^[\\w\-]{1,}\\.xml$" (*.xml)).
 *   TargetFolder: String The local folder in which will be placed the archive, relatively to IMPEX/.
 *   ArchiveName: String The name of the compressed file.
 *   RemoveFilesFromSourceFolder: Boolean Ask the script to remove the files from the source folder when adding them to the archive.
 *   RemoveSourceFolderAfterCompletion: Boolean Ask the script to remove the source folder after completion. Can be usefull if the archive is stored in another directory than the source files to avoid having empty folders.
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
    var removeFilesFromSourceFolder = args.RemoveFilesFromSourceFolder;
    var removeSourceFolderAfterCompletion = args.RemoveSourceFolderAfterCompletion;
    var sourceFolder = StepUtil.replacePathPlaceholders(args.SourceFolder);
    var targetFolder = StepUtil.replacePathPlaceholders(args.TargetFolder);
    var archiveName = StepUtil.replacePathPlaceholders(args.ArchiveName);

    // Test mandatory parameters
    if (empty(sourceFolder) || empty(targetFolder) || empty(archiveName)) {
        return new Status(Status.ERROR, 'ERROR', 'One or more mandatory parameters are missing.');
    }

    var sourceDirStr = File.IMPEX + (sourceFolder.charAt(0).equals(File.SEPARATOR) ? sourceFolder + File.SEPARATOR : File.SEPARATOR + sourceFolder);
    var fileList = FileHelper.getFiles(sourceDirStr, filePattern);
    if (fileList.length === 0) {
        switch (noFilesFoundStatus) {
        case 'ERROR':
            return new Status(Status.ERROR, 'ERROR', 'No files to compress.');
        default:
            return new Status(Status.OK, 'NO_FILE_FOUND', 'No files to compress.');
        }
    }

    // Compress files
    if (!FileHelper.zipFiles(fileList, targetFolder, archiveName, removeFilesFromSourceFolder)) {
        return new Status(Status.ERROR, 'ERROR', 'An error occurred while compressing files.');
    }

    if (removeSourceFolderAfterCompletion === true) {
        FileHelper.removeFile(new File(sourceDirStr));
    }

    return new Status(Status.OK, 'OK', 'Files successfully compressed.');
};

exports.Run = run;
