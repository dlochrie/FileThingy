var FileThingy = require('./lib/filethingy'),
    Util = require('./lib/util');

/**
 * Kick the whole process off.
 */
var args = process.argv;
var sourceDir = (args.length > 2) ? args[2] : null;


/**
 * Initialize Util Class.
 */
var util = new Util();


/**
 * Initialize FileThingy Class.
 */
var fthingy = new FileThingy({
  sourceDir: sourceDir
});


/**
 * Shows help message if no directory is provided.
 */
if (!sourceDir) {
  util.help();
}


/**
 * Start crawling the Directory(s).
 */
var indexStart = new Date();
console.log('Starting to index files and directories.');
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
  console.log('Done proceesing.');
  console.log('Processed in ' + util.getExecutionTime(start) + ' seconds.');
});
