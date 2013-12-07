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
 * List of files to ignore.
 * @type {Array.<string>}
 */
FileThingy.prototype.ignored = [];


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
 * RegExp of file extensions determining that a directory be discarded.
 * @const
 * @private {RegExp}
 */
FileThingy.prototype.INVALID_DIRECTORY_TYPES = /^(@eaDir)$/i;


/**
 * RegExp of file extensions determining that a file be discarded.
 * @const
 * @private {RegExp}
 */
FileThingy.prototype.INVALID_FILE_TYPES = /.(DS_Store|ini|db|@SynoEAStream)$/i;


/**
 * Adds a slash at the end if it doesn't have one.
 * @param {string} string String to add slash to.
 */
FileThingy.prototype.addSlash = function(string) {
  return (string.slice(-1) !== '/') ? string + '/' : string;
};


/**
 * Removes the slash at the end if it hase one.
 * @param {string} string String to remove the slash from.
 */
FileThingy.prototype.chopSlash = function(string) {
  return (string.slice(-1) !== '/') ? string :
      string.substring(0, string.length - 1);
};


/**
 * Generates a new directory based on a Recipe. If no Recipe is available,
 * generates a directory name based on the default Recipe.
 * @param {string} oldName Original name of file or directory.
 * @param {function(<bool>,<string>)} done Callback to fire when done.
 * @return {string} Newly generated directory name.
 * @private
 */
FileThingy.prototype.getDirName_ = function(oldName, done) {
  var newName = '';
  var re = /(.*\D)(\d+.\w+)/; // Should be CONST

  // Get the path after the last slash.
  var rawName = String(oldName);
  var parts = this.chopSlash(rawName).split('/');
  rawName = parts.pop().trim();

  /**
   * Strips the file extension, if one exists.
   * If we are extrating a suitable directory name from the file, then it's
   * not uncommon to have to do this.
   *
   * TODO: Use NODE to do this better.
   */
  rawName.replace(re, function(match, p1, p2) {
    newName = p1 || p2;
  });

  newName = newName || rawName;
  if (!newName) return done(true);

  /**
   * Default Recipe: Merge Duplicates
   * Yellowstone and Grand Teton_2 ~to~ Yellowstone and Grand Teton
   */
  return done(null, newName
    .replace(/[\W]*$/, '') // Strips Non-Word Chars at the end.
    .replace(/^.*_[\d]+$/, '') // Combine Duplicate Dirs, ie DIR_1, DIR_2.
    .trim())
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
      var file = dir + item;
      
      /**
       * Runs a file-system `stat` on the file or directory, providing
       * lower-level information about the file or directory.
       */
      fs.stat(file, function(err, stat) {

        if (err) {
          self.ignored.push(file);
          return next();
        }

        /**
         * If this is a directory, then repeat the process.
         */

        if (stat && stat.isDirectory()) {

          /**
           * Checks if the directory should be ignored, if so, it is skipped.
           */
          if (self.INVALID_DIRECTORY_TYPES.test(item)) {
            return next();
          }

          /**
           * Perform a recursive directory read.
           */

          self.walk(self.addSlash(file), function(err, res) {
            if (err) self.complain(err);
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
             * This is NOT the root directory, therefore keep it.
             */

            curDir = dir;

          } else {

            /**
             * This IS the root directory, either (1), extract a new directory
             * name from the file, or (2), just rename the file and keep at the
             * root level - the default is (1).
             */

            curDir = item;

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

          self.getDirName_(curDir, function(err, dirName) {
            if (err) {
              self.complain('There was a problem renaming the directory:\t',
                  curDir);
            }
            structure[dirName] = structure[dirName] || [];
            structure[dirName].push({
              oldPath: dir,
              oldName: item,
              newName: newName
            });
            next();
          });
        }
      });
    })();
  });
};


/**
 * Exposes FileThingy Contructor.
 */
module.exports = FileThingy;