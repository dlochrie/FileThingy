var fs = require('fs');



/**
 * @constructor
 * @param {string=} opt_targetDir Optional target directory.
 */
function Log(opt_targetDir) {
  /**
   * Target Dir for log, if one doesn't exist, try to log to `/tmp`.
   * @type {?string}
   */
  this.targetDir = opt_targetDir || this.DEFAULT_LOG_DIR;

  // Initialize the Log.
  this.initLog();
}


/**
 * @type {fs.WriteStream}
 */
Log.prototype.stream = null;


/**
 * TODO: This SHOULD be written as a manifest in the TARGET dir!
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


/**
 * Logs an error message.
 * TODO: Add some pretty colors!!!
 * @param {string=} opt_err Optional error message.
 */
Log.prototype.error = function(opt_err) {
  err = opt_err || 'Error type N/A.';
  this.write_('Error:\n\t' + err);
  process.exit();
};


/**
 * Logs a message.
 * TODO: Add some pretty colors!!!
 * @param {!string} msg Message to log.
 */
Log.prototype.message = function(msg) {
  this.write_(msg);
};


/**
 * Reports on the results of the directory crawl.
 * TODO: Add some pretty colors!!!
 * TODO: Provide an option to Abort if necessary.
 * @param {!Filethingy} fthingy Filethingy object instance.
 */
Log.prototype.report = function(fthingy) {
  var totalFiles = fthingy.fileCount,
      directories = Object.keys(fthingy.structure).length,
      discarded = fthingy.discarded.length,
      ignored = fthingy.ignored.length,
      processedFiles = totalFiles - discarded;

  this.message(totalFiles + '\tfiles were found.');
  this.message(directories + '\tdirectories will be created.');
  this.message(discarded + '\tfiles will be discarded.');
  this.message(ignored + '\tfiles will be ignored.');
  this.message(processedFiles + '\tfiles will be renamed.');
};


/**
 * @param {string} msg Message to write.
 * @private
 */
Log.prototype.write_ = function(msg) {
  /**
   * TODO: Only show console output if "verbose" flag was added.
   */
  console.log(msg);
  this.stream.write(msg + '\n');
};


/**
 * @expose
 * Expose Log Class.
 */
module.exports = Log;
