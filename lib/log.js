var fs = require('fs');



/**
 * @constructor
 */
function Log(targetDir) {
  /**
   * Target Dir for log, if one doesn't exist, try to log to `/tmp`.
   * @type {?string}
   */
  this.targetDir = targetDir || this.DEFAULT_LOG_DIR;

  // Initialize the Log.
  this.initLog();
}

/**
 * @type {fs.WriteStream}
 */
Log.prototype.stream = null; 


/**
 * @const
 * @type {fs.WriteStream}
 */
Log.prototype.DEFAULT_LOG_DIR = '/tmp/'; 


/**
 * Creates the log file and determines if it is writable.
 */
Log.prototype.initLog = function() {
  var date = + new Date().getTime();
  this.stream = fs.createWriteStream(this.targetDir + '.FileThingy.' + date);
};

/** TODO: Add some pretty colors!!! */
Log.prototype.error = function(err) {
  err = err || 'N/A';
  this.stream.write('Error:\n');
  this.stream.write('\t' + err + '\n');
};


/** TODO: Add some pretty colors!!! */
Log.prototype.message = function(msg) {
  this.stream.write('Message:\t');
  this.stream.write(msg + '\n');
};


/**
 * @expose
 * Expose Log Class.
 */
module.exports = Log;