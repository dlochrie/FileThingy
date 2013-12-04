var fs = require('fs'),
  structure = {},
  discarded = [];

// CONSTANTS
var PATH = 'should come from STDIN... or ARGV';
var INVALID_FILE_TYPES = /.(DS_Store|ini|db|@SynoEAStream)$/i;



function FileThingy() {}


// TODO: Make this generic enough to accept different renaming recipes.
FileThingy.prototype.getDirName = function(oldName) {
  // Yellowstone and Grand Teton_2 ~to~ Yellowstone and Grand Teton
  var newName = String(oldName).trim();
  var newName = oldName.replace(/_\d/g, '');
  return newName; 
};


// TODO: Make this generic enough to accept different renaming recipes.
FileThingy.prototype.getFileName = function(oldName) {
  oldName = String(oldName).trim(); //TODO: ? what if null or undefined???
  parts = oldName.split(/_\d/);
  var newName = (parts[parts.length -1] || parts[1]).toLowerCase();
  console.log('oldName:', oldName, '\tnewName:', newName)
  return newName; 
};


FileThingy.prototype.process = function() {
  for (directory in structure) {
    //console.log('New Directory', directory)
  }
};


/**
 * Nice IIFE taken from here: http://stackoverflow.com/a/5827895.
 */
FileThingy.prototype.walk = function(dir, done) {
  var self = this;
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var i = 0;
    (function next() {
      var file = list[i++];
      if (!file) return done(null, results);
      file = dir + file;

      // Check if the file is invalid, if so, discard.
      if (INVALID_FILE_TYPES.test(file)) {
        discarded.push(file);
        return next();
      }

      fs.stat(file, function(err, stat) {
        // If it is a directory, repeat
        if (stat && stat.isDirectory()) {
          // Rename directory...
          var dirName = self.getDirName(file);
          self.walk(dirName, function(err, res) {
            next();
          });
        // If it is a file, append to the new structure.
        } else {
          var parts = file.split('-');
          var newDir = self.getDirName(parts[0]);
          var curDir;
          // If it is not the existing directory, and it hasn't been added, then
          // create it.
          if (dir !== PATH) {
            curDir = (structure[dir]) ? structure[dir] : structure[dir] = [];
          } else {
            if (!structure[newDir]) structure[newDir] = [];
            curDir = structure[newDir];
          }
          var fname = self.getFileName(file); 
          curDir.push({path: file, name: fname});
          next();
        }
      });
    })();
  });
};


/**
 * Kick the whole process off.
 */
var fthingy = new FileThingy();
fthingy.walk(PATH, function(err, results) {
  if (err) throw err;
  fthingy.process();
});