var fs = require('fs'),
  util = require('util'),
  Util = require('./util');


var INVALID_FILE_TYPES = /.(DS_Store|ini|db|@SynoEAStream)$/i;



/**
 * @constructor
 */
function FileThingy(opts) {
  this.sourceDir = opts.sourceDir || this.help();
}


// Extend FileThingy with Util Class.
util.inherits(FileThingy, Util);


/**
 * @type {Object<>}
 * @private
 */
FileThingy.prototype.structure_ = {};


/**
 * @type {Array<Object<>>}
 * @private
 */
FileThingy.prototype.discarded_ = [];


// TODO: Make this generic enough to accept different renaming recipes.
FileThingy.prototype.getDirName = function(oldName) {
  // Yellowstone and Grand Teton_2 ~to~ Yellowstone and Grand Teton
  var newName = String(oldName);
  newName = oldName.replace(/_\d/g, '').trim(); 
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
  for (directory in this.structure_) {
    console.log('New Directory', directory);
    this.structure_[directory].forEach(function(file) {
      console.log('\t', file.name)
    });
  }
};


/**
 * Nice IIFE taken from here: http://stackoverflow.com/a/5827895.
 */
FileThingy.prototype.walk = function(dir, done) {
  var self = this;
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) self.complain(err);
    var i = 0;
    (function next() {
      var item = list[i++];
      if (!item) return done(null, results);
      file = dir + item;

      // Check if the file is invalid, if so, discard.
      if (INVALID_FILE_TYPES.test(item)) {
        self.discarded_.push({name: item, path: dir});
        return next();
      }

      fs.stat(file, function(err, stat) {
        /**
         * If this is a directory, then repeat.
         */

        if (stat && stat.isDirectory()) {
          self.walk(file + '/', function(err, res) {
            next();
          });

        /**
         * If it is a file, append to the new structure_.
         */
        } else {

          // 1. Look to see if there is a directory for this file.
          // 2. If there is a directory, append the file.
          // 3. If there is NOT a directory, create one, and then append the file.

          var curDir;
          var structure = self.structure_;
          var timeStamp = stat.mtime.getTime() || + new Date;

          /**
           * This is NOT the root directory, therefore keep it.
           */

          if (dir !== self.sourceDir) {
            curDir = (structure[dir]) ? structure[dir] : structure[dir] = [];


          /**
           * This is the root directory, either (1), extract a new directory
           * name from the file, or (2), just rename the file and keep at the 
           * root level - the default is (1).
           */

          } else {
            var newDir = self.getDirName(dir);
            if (!structure[newDir]) structure[newDir] = [];
            curDir = structure[newDir];
          }

          var fileName = self.getFileName(item, timeStamp);
          // TODO: Is the `dir` right for `path`???
          curDir.push({path: dir, name: fileName});

          
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