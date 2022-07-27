/**
 * Job Step Type that moves (or copies) files from folder A to folder B
 */

'use strict';

var Logger = require('dw/system/Logger').getLogger('cs.job.MoveFiles');
var File = require('dw/io/File');
var Status = require('dw/system/Status');

var FileHelper = require('~/cartridge/scripts/file/FileHelper');
var StepUtil = require('~/cartridge/scripts/util/StepUtil');

/**
 * Bootstrap function for the Job
 *
 * @return {dw.system.Status} Exit status for a job run
 */
var run = function () {
    var args = arguments[0];

    if (StepUtil.isDisabled(args)) {
        return new Status(Status.OK, 'OK', 'Step disabled, skip it...');
    }

    // Load input Parameters
    var sourceFolder = StepUtil.replacePathPlaceholders(args.SourceFolder);
    var targetFolder = StepUtil.replacePathPlaceholders(args.TargetFolder);

    var filePattern = args.FilePattern;
    var copyOnly = args.CopyOnly;
    var doOverwrite = args.Overwrite;
    var noFilesFoundStatus = args.NoFileFoundStatus;
    var recursive = args.Recursive;

    // Open directories and check for existence
    var sourceDirectory = new File(sourceFolder);
    var targetDirectory = new File(targetFolder);

    if (!sourceDirectory.exists()) {
        Logger.error('Source folder does not exists so we cannot move files from that directory: ' + sourceFolder);
        return new Status(Status.ERROR, 'ERROR', 'Source folder does not exist.');
    }

    if (!sourceDirectory.isDirectory()) {
        Logger.error('Source folder is not a directory: ' + sourceFolder);
        return new Status(Status.ERROR, 'ERROR', 'Source folder is not a directory.');
    }

    if (targetDirectory.exists() && !targetDirectory.isDirectory()) {
        Logger.error('Target folder is not a directory: ' + targetDirectory);
        return new Status(Status.ERROR, 'ERROR', 'Target folder does not exist.');
    }

    // In case the target directory does not exist
    // create it before moving files and inform in the logs
    if (!targetDirectory.exists()) {
        Logger.info('Target folder does not exist yet, create it before moving files: ' + targetDirectory);
        targetDirectory.mkdirs();
    }
    try {
        var filteredList = FileHelper.getFileListRecursive(sourceDirectory, filePattern, sourceFolder, targetFolder, recursive, doOverwrite, true);
    } catch (e) {
        if (e == 'OverWriteWithoutPermission') {
            return new Status(Status.ERROR, 'ERROR', 'Tried to overwrite file without permission.');
        }
    }
    if (filteredList.length === 0) {
        Logger.info('Nothing to copy.');

        switch (noFilesFoundStatus) {
            case 'ERROR':
                return new Status(Status.ERROR, 'ERROR', 'No files to copy.');

            default:
                return new Status(Status.OK, 'NO_FILE_FOUND', 'No files to copy.');
        }
    }

    // Second iteration: Copy/Move files
    filteredList.forEach(function (filterEl) {
        let element = filterEl.name;
        Logger.info('  - {0}: {1}', (copyOnly ? 'copying' : 'moving'), element);

        var sourceFile = filterEl.sourceFile;
        var targetFile = filterEl.targetFile;

        // Existing target file: Delete if overwrite mode enabled
        if (targetFile.exists()) {
            if (!doOverwrite) {
                Logger.error('  - skipping existing file (did not exist during check: {0})', element);
                return;
            }
            targetFile.remove();
        }

        if (filterEl.createDirectory && recursive) {
            Logger.debug('  - create directory: {0}', element);
            targetFile.mkdirs();
        } else {
            if (copyOnly) {
                // Copy the file
                Logger.debug('  - copying: {0}', element);
                sourceFile.copyTo(targetFile);
            } else {
                // Move the file
                Logger.debug('  - moving: {0}', element);
                sourceFile.renameTo(targetFile);
            }
        }
    });
    return new Status(Status.OK);
};

exports.Run = run;
