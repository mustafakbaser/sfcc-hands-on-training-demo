/**
* Job Step Type that moves (or copies) files from folder A to folder B
*/

'use strict';

var Logger = require('dw/system/Logger').getLogger('cs.job.CleanUpFiles');
var File = require('dw/io/File');
var System = require('dw/system/System');
var Status = require('dw/system/Status');
var Calendar = require('dw/util/Calendar');

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
    var workingFolder = StepUtil.replacePathPlaceholders(args.WorkingFolder);

    var filePattern = args.FilePattern;
    var noFilesFoundStatus = args.NoFileFoundStatus;
    var oldCalendar = System.getCalendar();
    oldCalendar.add(Calendar.DAY_OF_YEAR, -1 * args.DaysToKeep);
    oldCalendar.add(Calendar.MINUTE, -10);

    // Open directory and check for existence
    var workingDirectory = new File(workingFolder);

    if (!workingDirectory.exists()) {
        Logger.error('Working folder does not exists so we cannot delete files from that directory: ' + workingFolder);
        return new Status(Status.ERROR, 'ERROR', 'Working folder does not exist.');
    }

    if (!workingDirectory.isDirectory()) {
        Logger.error('Working folder is not a directory: ' + workingFolder);
        return new Status(Status.ERROR, 'ERROR', 'Working folder is not a directory.');
    }

    var list = workingDirectory.list();
    var filteredList = [];

    // First iteration: Filter with RegEx, check for existing target files if overwrite is off

    list.forEach(function (element) {
        // Check RegEx pattern
        if (filePattern && element.match(filePattern) === null) {
            return;
        }

        filteredList.push(element);
    });

    if (filteredList.length === 0) {
        Logger.info('Nothing to delete.');

        switch (noFilesFoundStatus) {
        case 'ERROR':
            return new Status(Status.ERROR, 'ERROR', 'No files to delete.');

        default:
            return new Status(Status.OK, 'NO_FILE_FOUND', 'No files to delete.');
        }
    }

    // Second iteration: Delete files
    filteredList.forEach(function (element) {
        // Check RegEx pattern
        if (filePattern && element.match(filePattern) === null) {
            Logger.debug('  - skipping because of RegEx: {0}', element);
            return;
        }

        var sourceFile = new File(workingFolder + '/' + element);

        var fileCalendar = new Calendar(new Date(sourceFile.lastModified()));
        if (fileCalendar.before(oldCalendar)) {
            Logger.info('  - {0}: {1}', 'deleting', element);
            sourceFile.remove();
        }
    });

    return new Status(Status.OK);
};

exports.Run = run;
