var fs = require('fs'),
  util = require('util'),
  Util = require('./util');



/**
 * @constructor
 * @extends Util Class
 * @param {Object} opts Options object.
 */
function FileThingy(opts) {
  this.sourceDir = opts.sourceDir || this.help();
}


// Extend FileThingy with Util Class.
util.inherits(FileThingy, Util);


/**
 * List of files (and their paths) to discard.
 * @type {Array.<Object.<string, string>>}
 */
FileThingy.prototype.discarded = [];


/**
 * File count. Initially set to zero. 
 * @type {number}
 */
FileThingy.prototype.fileCount = 0;


/**
 * Stores the directory structure for processing.
 * TODO: Work on type annotation.
 * @type {Object.<string, Object.<string, string>>}
 */
FileThingy.prototype.structure = {};


/**
 * RegExp of file extensions determining that a file be discarded.
 * @const
 * @private {RegExp}
 */
FileThingy.prototype.INVALID_FILE_TYPES = /.(DS_Store|ini|db|@SynoEAStream)$/i;


// TODO: Make this generic enough to accept different renaming recipes.
FileThingy.prototype.getDirName = function(oldName) {

  // Default Recipe: Merge Duplicates
  // Yellowstone and Grand Teton_2 ~to~ Yellowstone and Grand Teton
  var rawName = String(oldName);
  var newName = '';
  var re = /(.*\D)(\d+.\w+)/; // Should be CONST
  rawName.replace(re, function(match, p1, p2) {
    newName = p1 || p2;
  });

  if (newName) {
    // Strips Non-Word Chars at the end.
    newName = newName.replace(/[\W]*$/, '');
    // Combine Duplicate Dirs, ie DIR_1, DIR_2.
    newName = newName.replace(/_[\d]*$/, '');
    // Trim the string.
    newName = newName.trim();
  } else {
    // ... TODO: What should we do if a name was NOT found?
  }

  // Adds a slash at the end if it doesn't have one.
  if (newName.slice(-1) !== '/') {
    newName += '/';
  }
  return newName;
};


// TODO: Make this generic enough to accept different renaming recipes.
FileThingy.prototype.getFileName = function(fileName, timeStamp) {
  // Default Recipe - takes the final digits and extension only.
  var re = /.*\D(\d.\w)/;
  var newName = fileName.replace(re, '$1').toLowerCase();
  return timeStamp + "." + newName;
};


FileThingy.prototype.process = function() {
  for (directory in this.structure) {
    //console.log('New Directory:\t', directory);
    this.structure[directory].forEach(function(file) {
      //console.log('\t', file.newName)
    });
  }
};


/**
 * Nice IIFE taken from here: http://stackoverflow.com/a/5827895.
 */
FileThingy.prototype.walk = function(dir, done) {
  var self = this;

  /**
   * Reads the directory asynchronously.
   */
  fs.readdir(dir, function(err, list) {
    if (err) self.complain(err);
    var i = 0;
    (function next() {
      var item = list[i++];
      if (!item) return done(null);
      file = dir + item;

      /**
       * Runs a file-system `stat` on the file or directory, providing
       * lower-level information about the file or directory.
       */
      fs.stat(file, function(err, stat) {

        /**
         * If this is a directory, then repeat the process.
         */

        if (stat && stat.isDirectory()) {
          self.walk(file + '/', function(err, res) {
            next();
          });

        } else {

          /**
           * Increment the filecount for statistical information.
           */
          self.fileCount++;

          /**
           * Checks if the file is invalid, if so, it is discarded.
           */
          if (self.INVALID_FILE_TYPES.test(item)) {
            self.discarded.push({name: item, path: dir});
            return next();
          }

          // 1. Look to see if there is a directory for this file.
          // 2. If there is a directory, append the file.
          // 3. If there is NOT a directory, create one, and then append the file.

          var curDir;
          var structure = self.structure;
          
          if (dir !== self.sourceDir) {

            /**
             * This is NOT the root directory, therefore keep it and rename it.
             */

            curDir = self.getDirName(dir);

          } else {

            /**
             * This IS the root directory, either (1), extract a new directory
             * name from the file, or (2), just rename the file and keep at the
             * root level - the default is (1).
             */

            console.log('Should create a NEW directory')
            curDir = self.getDirName(item);
            console.log('NEW directory:\t', curDir)

          }

          /**
           * Rename the file and add it to the proper directory.
           */

          // TODO: Timestamp should come from a Recipe, or be generated in the
          // getFileName method.
          var timeStamp = stat.mtime.getTime() || + new Date;
          var newName = self.getFileName(item, timeStamp);

          /**
           * Save a reference to the original file and path so we can find it
           * when we are processing it. 
           */

          structure[curDir] = structure[curDir] || [];
          structure[curDir].push({
            oldPath: dir,
            oldName: item,
            newName: newName
          });

          next();
        }
      });
    })();
  });
};


/**
 * Exposes FileThingy Contructor.
 */
module.exports = FileThingy;