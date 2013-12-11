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
console.log('Starting to index files and directories.');
fthingy.crawl(sourceDir, function(err) {
  // TODO: This doesn't handle anything...
  if (err) return process.sterr(err);

  console.log('Done Indexing.');
  console.log('Index Time:\t' + util.getExecutionTime(indexStart) +
      ' seconds.');

  /** Begin Report - Should be logged! */
  var totalFiles = fthingy.fileCount,
      directories = Object.keys(fthingy.structure).length,
      discarded = fthingy.discarded.length,
      ignored = fthingy.ignored.length,
      processedFiles = totalFiles - discarded;

  console.log(totalFiles + ' files were found.');
  console.log(directories + ' directories will be created.');
  console.log(discarded + ' files will be discarded.');
  console.log(ignored + ' files will be ignored.');
  console.log(processedFiles + ' files will be renamed.');
  /** End Report - Should be logged! */

  console.log('\nStarting to Process.\n');
  var start = new Date();
  fthingy.process(function(err) {
    console.log('Done processing.');
    console.log('Process Time:\t' + util.getExecutionTime(start) + ' seconds.');
    console.log('Total Time:\t' + util.getExecutionTime(indexStart) +
        ' seconds.');
  });
});
