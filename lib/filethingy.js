var fs = require('fs'),
    util = require('util'),
    Log = require('./log'),
    Queue = require('./queue'),
    Util = require('./util');



/**
 * @param {Object} opts Options object.
 * @constructor
 * @extends {Util}
 */
function FileThingy(opts) {
  /**
   * Check for an optional file limit flag.
   * @type {?number}
   */
  this.fileLimit = opts.fileLimit || null;

  /**
   * Check for an optional file limit flag.
   * @type {?boolean}
   */
  this.shouldLog = opts.shouldLog || false;

  /**
   * Without a Source Directory, there is nothing to do - so show help if one
   * wasn't provided.
   * @type {?string}
   */
  this.sourceDir = opts.sourceDir || this.help();

  /**
   * Target Directory where the files and directories should be placed.
   * @type {?string}
   */
  this.targetDir = opts.targetDir || this.help();
}


/** FileThingy extends Util Class. */
util.inherits(FileThingy, Util);


/**
 * @type {Array.<Object>} List of files (and their paths) to discard.
 */
FileThingy.prototype.discarded = [];


/**
 * @type {number} File count. Initially set to zero.
 */
FileThingy.prototype.fileCount = 0;


/**
 * @type {Array.<string>} List of files to ignore.
 */
FileThingy.prototype.ignored = [];


/**
 * @type {Log} Log Class Instance.
 */
FileThingy.prototype.log = new Log();


/**
 * @type {Queue} File Queue Instance;
 */
FileThingy.prototype.queue = new Queue(this.fileLimit);


/**
 * Stores the directory structure for processing.
 * @enum {Object}
 */
FileThingy.prototype.structure = {};


/**
 * @const
 * @type {RegExp} Invalid directory names.
 */
FileThingy.prototype.INVALID_DIRECTORY_TYPES = /^(@eaDir)$/i;


/**
 * @const
 * @type {RegExp} File extensions for files that should be discared/skipped.
 */
FileThingy.prototype.INVALID_FILE_TYPES = /.(DS_Store|ini|db|@SynoEAStream)$/i;


/**
 * @const
 * @type {Array<string>}
 */
FileThingy.prototype.SAFE_ERRORS = [
  'EEXIST' // File or Directory already exists
];


/**
 * @const
 * @type {Array<string>}
 */
FileThingy.prototype.UNSAFE_ERRORS = [
  'ENOENT' // Directory does NOT exist.
];


/**
 * Copies files from the source to the target, renaming based on the structure
 * determined by the initial crawl.
 * @param {string} source Path to the original file to copy.
 * @param {string} target New path and name of file.
 * @param {function(string)} cb Callback with optional error to fire when done.
 */
FileThingy.prototype.copyFile = function(source, target, cb) {
  var self = this;

  var readFile = fs.createReadStream(source);
  readFile.on('error', function(err) {
    done(err);
  });

  var writeFile = fs.createWriteStream(target);
  writeFile.on('error', function(err) {
    done(err);
  });

  writeFile.on('close', function(ex) {
    done();
  });

  readFile.pipe(writeFile);

  function done(err) {
    if (err) {
      self.log.error('There was an error copying the file:\t' + err);
    } else {
      self.log.message('Successfully copied:\t' + target);
    }
    cb(err);
  }
};


/**
 * Crawl the directory(s) recursively, creating a new directory structure based
 * on file and directory Recipes provided.
 *
 * Nice IIFE taken from here: http://stackoverflow.com/a/5827895.
 * @param {string} dir The directory to crawl.
 * @param {function(string)} done Callback function to fire when done.
 * @public
 */
FileThingy.prototype.crawl = function(dir, done) {
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

          self.crawl(self.addSlash(file), function(err, res) {
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

          /**
           * 1. Look to see if there is a directory for this file.
           * 2. If there is a directory, append the file.
           * 3. If there is NOT a directory, create one, and then append the
           *     file.
           */

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

          // TODO: `mtime` returns an ugly timestamp - should be truncated.
          var timeStamp = ((stat.mtime.getTime() || + new Date) / 1000);
          var newName = self.getFileName_(item, timeStamp);

          var fileObject = {
            oldPath: dir,
            oldName: item,
            newName: newName
          };

          /**
           * Save a reference to the original file and path so we can find it
           * when we are processing it.
           */

          self.getDirName_(curDir, function(err, dirName) {
            if (err) {
              self.complain('There was a problem renaming the directory:\t',
                  curDir);
            }

            /**
             * If a directory could be extracted from the name, then add this
             * file to the `UNSORTED` directory.
             */
            dirName = dirName || 'UNSORTED';

            /**
             * Add this file to the proper directory index in the new structure.
             */
            structure[dirName] = structure[dirName] || [];
            structure[dirName].push(fileObject);

            next();
          });
        }
      });
    })();
  });
};


/**
 * Generates a new directory based on a Recipe. If no Recipe is available,
 *     generates a directory name based on the default Recipe.
 * @param {string} oldName Original name of file or directory.
 * @param {function(boolean, string)} done Callback to fire when done.
 * @return {string} Newly generated directory name.
 * @private
 */
FileThingy.prototype.getDirName_ = function(oldName, done) {
  var newName = '';
  var re = /(.*\D)(\d+.\w+)/; // Should be CONST

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
  if (!newName) {
    return done(true);
  }

  /**
   * Default Recipe: Merge Duplicates
   * Yellowstone and Grand Teton_2 ~to~ Yellowstone and Grand Teton
   */
  return done(null, newName
    .replace(/[\W]*$/, '') // Strips Non-Word Chars at the end.
    .replace(/^.*_[\d]+$/, '') // Combine Duplicate Dirs, ie DIR_1, DIR_2.
    .trim());
};


/**
 * Generates a new file name based on a Recipe. If no Recipe is available, it
 *     generates a file name based on the default Recipe.
 *     TODO: Make this generic enough to accept different renaming recipes.
 * @param {string} fileName Name of file to rename.
 * @param {?string} prepend Optional string to prepend to file name.
 * @return {string} Newly generated file name.
 * @private
 */
FileThingy.prototype.getFileName_ = function(fileName, prepend) {
  // Default Recipe - takes the final digits and extension only.
  var re = /.*\D(\d.\w)/;
  var newName = fileName.replace(re, '$1').toLowerCase();
  return prepend ? prepend + '.' + newName : newName;
};


/**
 * Process the new directory structure, creating new directories and renaming
 * files.
 *
 * NOTE: This SHOULD be asynchronous, from here on, or it can be very slow.
 * TODO: It's NOT asynchronous now, MAKE it asynchronous.
 *
 * 1. Takes a directory from the  new directory structure, and attempts to
 *     create it.
 * 2. Starts adding files to the new directory. If the "delete" flag was sent,
 *     then the file will be "moved", not "copied".
 *
 * @param {function(string)} done Callback to fire when done.
 */
FileThingy.prototype.process = function(done) {
  var self = this;
  this.processDirectories(function(err) {
    self.log.message('Done processing directories.');
    self.processFiles(function(msg) {
      if (err) {
        self.log.error('EMFILE: Too many files open at once.');
        return done(err);
      }
      self.queue.execute(function(msg) {
        done(msg);
      });
    });
  });
};


/**
 * Adds a function for creating a directory to the queue.
 * @param {function} done Callback to fire when all directories have been
 *     processed.
 */
FileThingy.prototype.processDirectories = function(done) {
  var dirs = Object.keys(this.structure);
  var target = this.targetDir;
  var self = this;

  var i = 0;
  (function next() {
    var dir = dirs[i++];
    if (!dir) {
      return done();
    }
    var path = target + dir;
    fs.mkdir(path, function(err) {
      if (err && self.SAFE_ERRORS.indexOf(err.code) === -1) {
        if (err.code === 'ENOENT') {
          self.log.error('The Target directory does not exist, or you do not ' +
              'have permission to write to it.');
        } else {
          self.log.error(err);
        }
      } else {
        self.log.message('Done adding directory:\t' + path);
      }
      next();
    });
  })();
};


/**
 * Adds a function for moving / renaming a file to the queue.
 * @param {function} done Callback to fire when all directories have been
 *     processed.
 */
FileThingy.prototype.processFiles = function(done) {
  var dirs = Object.keys(this.structure);
  var target = this.targetDir;
  var self = this;

  dirs.forEach(function(dir) {
    var files = self.structure[dir];
    var path = target + dir;

    var i = 0;
    (function next() {
      var file = files[i++];
      if (!file) {
        self.log.message('Done queuing files for:\t' + dir);
        return done(null);
      }
      var fpath = path + '/' + file.newName;
      self.queue.addFile(function(cb) {
        self.copyFile(file.oldPath + file.oldName, fpath, cb);
      }, next());
    })();
  });
};


/**
 * Exposes FileThingy Contructor.
 */
module.exports = FileThingy;
