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
 * Start crawling the Directory(s).
 */
var indexStart = new Date();
console.log('Starting to index files and directories.');


// // Check if targetDir is writeable...
console.log('Check if targetDir is writeable...');
var stats = fs.statSync(targetDir);
console.log(stats.isDirectory());



fthingy.crawl(sourceDir, function(err) {
  // TODO: This doesn't handle anything...
  if (err) return process.sterr(err);

  console.log('Done Indexing.');
  console.log('Indexed in ' + util.getExecutionTime(indexStart) + ' seconds.');

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

  console.log('\nStarting to Process.\n');
  var start = new Date();
  fthingy.process();
  console.log('Done processing.');
  console.log('Processed in ' + util.getExecutionTime(start) + ' seconds.');
});
