var File = require('dw/io/File');

const TEMP_PATH = File.SEPARATOR + File.TEMP + File.SEPARATOR;
const IMPEX_PATH = File.SEPARATOR + File.IMPEX + File.SEPARATOR;
const ZIP_FILE_REG_EXP = /\.zip$/;

/**
 * Loads files from a given directory that match the given pattern
 * Non recursive.
 * Throws Exception if directory does not exist.
 *
 * @param {String} directoryPath (Absolute) Directory path to load from
 * @param {String} filePattern RegEx pattern that the filenames must match
 *
 * @returns {Array}
 */
var getFiles = function (directoryPath, filePattern) {
    var directory = new File(directoryPath);

    // We only want existing directories
    if (!directory.isDirectory()) {
        throw new Error('Source folder does not exist.');
    }

    var files = directory.list();

    return files.filter(function (filePath) {
        return empty(filePattern) || (!empty(filePattern) && filePath.match(filePattern) !== null);
    }).map(function (filePath) {
        return directoryPath + File.SEPARATOR + filePath;
    });
};

/**
 * Loads files from a given directory that match the given pattern
 * recursive.
 * Throws Exception if directory does not exist.
 *
 * @param {String} directoryPath (Absolute) Directory path to load from
 * @param {String} filePattern RegEx pattern that the filenames must match
 *
 * @returns {Array}
 */
var getFileListRecursive = function (sourceDirectory, filePattern, sourceFolder, targetFolder, recursive, doOverwrite, getTargetFile) {
    
    var regexp;
    if (!empty(filePattern)) {
        regexp = new RegExp(filePattern);
    }

    var filteredList = [];
    var getFileList = function getFileList(currentFile) {
        var targetFile = null;
        if (getTargetFile) {
            targetFile = new File(currentFile.getFullPath().replace(sourceFolder, targetFolder));
            if (targetFile.exists() && !doOverwrite) {
                throw 'OverWriteWithoutPermission';
            }
        } else {
            // remove source and IMPEX folder path :
            targetFile = currentFile.getFullPath().replace(sourceFolder, '').replace(File.IMPEX, '');
            if (!currentFile.isDirectory()) {
                // this is to avoid targetfileName + targetfileName from upload behavior
                targetFile = targetFile.replace(currentFile.getName(), '');
            }
            // add targetFolder
            targetFile = targetFolder + (targetFile.charAt(0).equals(File.SEPARATOR) ? targetFile.substring(1) : targetFile);
        }
        if (currentFile.isDirectory() && recursive) {
            filteredList.push({
                name: currentFile.getName(),
                sourceFile: currentFile,
                targetFile: targetFile,
                createDirectory: true
            });
            currentFile.listFiles(getFileList);
        } else if (empty(filePattern) || (!empty(filePattern) && regexp.test(currentFile.getName()))) {
            filteredList.push({
                name: currentFile.getName(),
                sourceFile: currentFile,
                targetFile: targetFile,
                createDirectory: false
            });
            return true;
        }
        return false;
    }
    if (sourceDirectory instanceof File) {
        sourceDirectory.listFiles(getFileList);
    } else {
        sourceDirectory = new File(sourceDirectory);
        if (!sourceDirectory.isDirectory()) {
            throw new Error('Source folder does not exist.');
        }
        sourceDirectory.listFiles(getFileList);
    }

    return filteredList;
};

/**
 * Check if a file with the given {filename} in the given {directoryPath} exists or not
 *
 * @param {String} directoryPath
 * @param {String} filename
 *
 * @returns {Boolean}
 */
var isFileExists = function (directoryPath, filename) {
    var file = new File(directoryPath + File.SEPARATOR + filename);
    return file.exists();
};

/**
 * Create the given {directoryPath} recursively if it does not exists
 *
 * @param {String} directoryPath
 *
 * @returns {dw/io/File} The created directory instance
 */
var createDirectory = function (directoryPath) {
    var directory = new File(directoryPath);

    if (!directory.exists() && !directory.mkdirs()) {
        throw new Error('Cannot create the directory ' + directoryPath);
    }

    return directory;
};

/**
 * Returns the file name of the file from the file path.
 *
 * @param {String} filePath A file path to extract the file name from, e.g. '/directory/file.xml'.
 *
 * @returns {String} The file name e.g. 'file.xml'.
 */
var getFileName = function (filePath) {
    var filePathParts = filePath.split(File.SEPARATOR);
    return filePathParts[filePathParts.length - 1];
};

/**
 * Moves the given {fileToMove} into the given {directory}.
 *
 * @param {dw/io/File} fileToMove File to move
 * @param {dw/io/File} directory Directory where to move the file in
 *
 * @returns {Boolean} Either the file has been successfully moved or not
 */
var moveFile = function(fileToMove, directory) {
    if (empty(fileToMove) || empty(directory)) {
        return false;
    }

    if (!directory.exists() && !directory.mkdirs()) {
        throw new Error('Cannot create the directory ' + directory.getFullPath() + ' to move the file ' + fileToMove.getName());
    }

    var fileDestination = new File(directory.getFullPath() + File.SEPARATOR + fileToMove.getName());
    return fileToMove.renameTo(fileDestination);
};

/**
 * Copy the given {fileToCopy} into the given {directory}.
 *
 * @param {dw/io/File} fileToCopy File to copy
 * @param {dw/io/File} directory Directory where to copy the file in
 *
 * @returns {Boolean} Either the file has been successfully moved or not
 */
var copyFile = function(fileToCopy, directory) {
    if (empty(fileToCopy) || empty(directory)) {
        return false;
    }

    if (!directory.exists() && !directory.mkdirs()) {
        throw new Error('Cannot create the directory ' + directory.getFullPath() + ' to copy the file ' + fileToCopy.getName());
    }

    var fileDestination = new File(directory.getFullPath() + File.SEPARATOR + fileToCopy.getName());
    return fileToCopy.copyTo(fileDestination);
};

/**
 * Prepends the {TEMP_PATH} path to provided {filePath} or returns
 * the {TEMP_PATH} path if provided {filePath} is empty.
 *
 * @param {String} filePath The file path to append to the {TEMP_PATH}
 *
 * @returns {String} The final generated path
 */
var getTempPath = function (filePath) {
    var path = TEMP_PATH;

    if (!empty(filePath)) {
        path = TEMP_PATH + filePath;
    }

    return path;
};

/**
 * Prepends the {IMPEX_PATH} path to provided {filePath} or returns
 * the {IMPEX_PATH} path if provided {filePath} is empty.
 *
 * @param {String} filePath The file path to append to the {IMPEX_PATH}
 *
 * @returns {String} The final generated path
 */
var getImpexPath = function (filePath) {
    var path = IMPEX_PATH;

    if (!empty(filePath)) {
        path = IMPEX_PATH + filePath;
    }

    return path;
};

/**
 * Compresses the given {directory} to the provided {zipFile}
 *
 * @param {dw/io/File} directory Directory to compress
 * @param {dw/io/File} zipFile File which will be the compressed file
 */
var compressDirectory = function (directory, zipFile) {
    if (!directory.exists()) {
        return undefined;
    }

    directory.zip(zipFile);
};


/**
 * Removes all files and sub directories if the given {directory} is a directory
 * Also traverses through sub directories and the removes this directory.
 * If the given {directory} is a file it removes it.
 *
 * @param {dw.io.File} directory Directory or file to remove
 *
 * @returns {Boolean} Either the directory has been successfully removed or not
 */
var removeFile = function(file) {
    if (!file.exists()) {
        return false;
    }

    if (file.isDirectory()) {
        var files = file.listFiles();
        if (!empty(files)) {
            files.toArray().forEach(function (fileToRemove) {
                // remove files inside the directory
                removeFile(fileToRemove);
            });
        }

        // now the directory is empty and it should be possible to remove it
        return file.remove();
    } else {
        return file.remove();
    }
};

/**
 * Uncompress the given {files} in the given {targetDirectoryPath}
 *
 * @param {Array} files The list of files to process
 * @param {String} targetDirectoryPath The path of the folder where to uncompress the files
 * @param {Boolean} useArchiveNameAsFolder Either if we have to use the archive name of each file as a sub-directory before unzipping the archive
 * @param {Boolean} removeArchivesAfterCompletion Either if we have to remove the archive files after completion
 *
 * @returns {Boolean} Either if all files have been successfully uncompressed or not
 */
var unzipFiles = function (files, targetDirectoryPath, useArchiveNameAsFolder, removeArchivesAfterCompletion) {
    if (files.length === 0) {
        return false;
    }

    var targetDirectory;
    targetDirectoryPath = getImpexPath(targetDirectoryPath) + (targetDirectoryPath.charAt(targetDirectoryPath.length - 1).equals(File.SEPARATOR) ? '' : File.SEPARATOR);

    // Loop across found files and only process .zip files
    return files.filter(function (file) {
        var archiveName = getFileName(file);
        return archiveName.substring(archiveName.length - 4, archiveName.length).toLowerCase() === '.zip';
    }).every(function (file) {
        var archiveFile = new File(file);
        var archiveName = getFileName(file);
        targetDirectory = createDirectory(targetDirectoryPath);

        archiveFile.unzip(targetDirectory);

        // By default, the platform create a folder with the archive name in the targetDirectory
        // i.e. /IMPEX/src/targetDirectory/archiveName.zip/unzippedFile.txt
        // But in some cases, we may want to have our uncompressed files directly in the targetDirectory
        if (useArchiveNameAsFolder !== true) {
            var uncompressedRootFolder = targetDirectory.getFullPath() + archiveName;
            var uncompressedFiles = getFiles(uncompressedRootFolder);
            uncompressedFiles.forEach(function (filePathToMove) {
                moveFile(new File(filePathToMove), targetDirectory);
            });

            removeFile(new File(uncompressedRootFolder));
        }

        if (removeArchivesAfterCompletion === true) {
            removeFile(archiveFile);
        }

        return true;
    });
};

/**
 * Compress the given {files} from the given {directoryPath}
 * in the given {targetDirectoryPath} in the given {archiveName} zip file.
 *
 * @param {Array} files The list of files to process
 * @param {String} targetDirectoryPath (Absolute) Directory path where to store the zip archive
 * @param {String} archiveName Archive name
 * @param {Boolean} removeFilesFromSourceFolder Either if the function has to remove the found files from the source folder or not when adding them to the archive
 *
 * @returns {Boolean} Either the archive has been successfully generated or not
 */
var zipFiles = function (files, targetDirectoryPath, archiveName, removeFilesFromSourceFolder) {
    if (files.length === 0) {
        return false;
    }

    // Append the .zip extension in case it's missing
    if (!ZIP_FILE_REG_EXP.test(archiveName.toLowerCase())) {
        archiveName += '.zip';
    }

    targetDirectoryPath = targetDirectoryPath + (targetDirectoryPath.charAt(targetDirectoryPath.length - 1).equals(File.SEPARATOR) ? '' : File.SEPARATOR);

    // Copy files to a temporary folder
    // As we can only zip a folder or a unique file in SFCC
    var tempFullPath = getTempPath(targetDirectoryPath + archiveName);
    var tempArchiveDirectory = createDirectory(tempFullPath);

    files.forEach(function (filePathToArchive) {
        if (removeFilesFromSourceFolder === true) {
            moveFile(new File(filePathToArchive), tempArchiveDirectory);
        } else {
            copyFile(new File(filePathToArchive), tempArchiveDirectory);
        }
    });

    // zip archive directory
	var zipFile = new File(tempFullPath.replace(TEMP_PATH, IMPEX_PATH));
	compressDirectory(tempArchiveDirectory, zipFile);

	// remove temp archive directory
	return removeFile(tempArchiveDirectory);
};

/**
 * Prepend a File.SEPARATOR to the given {path}
 *
 * @param {String} path The path to work with
 *
 * @returns {String} The modified path
 */
var prependSeparator = function (path) {
    if (empty(path)) {
        return path;
    }

    return path.charAt(0) === File.SEPARATOR ? path : File.SEPARATOR + path;
};

/**
 * Append a File.SEPARATOR to the given {path}
 *
 * @param {String} path The path to work with
 *
 * @returns {String} The modified path
 */
var appendSeparator = function (path) {
    if (empty(path)) {
        return path;
    }

    return path.charAt(path.length - 1) === File.SEPARATOR ? path : path + File.SEPARATOR;
};

module.exports.createDirectory = createDirectory;
module.exports.getFileName = getFileName;
module.exports.getFiles = getFiles;
module.exports.getFileListRecursive = getFileListRecursive;
module.exports.isFileExists = isFileExists;
module.exports.removeFile = removeFile;
module.exports.unzipFiles = unzipFiles;
module.exports.zipFiles = zipFiles;
module.exports.prependSeparator = prependSeparator;
module.exports.appendSeparator = appendSeparator;
