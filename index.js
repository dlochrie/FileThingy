var FileThingy = require('./lib/filethingy'),
    Util = require('./lib/util'),
    fs = require('fs');


/**
 * Initialize Util Class.
 */
var util = new Util();


/**
 * Handle the arguments passed:
 *     [0] node system command
 *     [1] FileThingy module
 *     [2] Source Directory
 *     [3] Target Directory
 */
var args = process.argv;
var sourceDir = args[2] || null;
var targetDir = args[3] || null;

if (!sourceDir) {
  util.help();
} else if (!targetDir) {
  util.formatHelp('targetDir', 'missing')
}


/**
 * Initialize FileThingy Class.
 */
var fthingy = new FileThingy({
  sourceDir: sourceDir,
  targetDir: targetDir
});


/**
 * Check if targetDir is writeable, and abort if it is not.
 */
stats = fs.stat(targetDir, function(err, stat) {
  // TODO: For now this only checks if it exists...
  if (err) {
    util.formatHelp('targetDir', 'error', targetDir);
  }
});


/**
 * Start crawling the Directory(s).
 */
var indexStart = new Date();
fthingy.log.message('Starting to index files and directories.');
fthingy.crawl(sourceDir, function(err) {
  // TODO: This doesn't seem to handle anything...
  if (err) return process.sterr(err);

  fthingy.log.message('Done Indexing.');
  fthingy.log.message('Index Time:\t' + util.getExecutionTime(indexStart) +
      ' seconds.');

  fthingy.log.report(fthingy);

  fthingy.log.message('\nStarting to Process.\n');
  var start = new Date();
  fthingy.process(function(err) {
    fthingy.log.message('Done processing.');
    fthingy.log.message('Process Time:\t' + util.getExecutionTime(start) +
        ' seconds.');
    fthingy.log.message('Total Time:\t' + util.getExecutionTime(indexStart) +
        ' seconds.');
  });
});
