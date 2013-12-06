var FileThingy = require('./lib/filethingy'),
    Util = require('./lib/util');

/**
 * Kick the whole process off.
 */
var args = process.argv;
var sourceDir = (args.length > 2) ? args[2] : null;

/**
 * Shows help message if no directory is provided.
 */
if (!sourceDir) {
  new Util().help();
}

/**
 * Initialize FileThingy.
 */
var fthingy = new FileThingy({
  sourceDir: sourceDir
});

console.log('Starting to index files and directories.')

/**
 * Start crawling the Directory(s).
 */
fthingy.walk(sourceDir, function(err) {
  if (err) return process.sterr(err);

  console.log('Done Indexing.')

  var totalFiles = fthingy.fileCount,
      directories = Object.keys(fthingy.structure).length,
      discarded = fthingy.discarded.length,
      processedFiles = totalFiles-discarded;

  console.log(totalFiles + ' files were found.');
  console.log(directories + ' directories will be created.');
  console.log(discarded + ' files will be discarded.');
  console.log(processedFiles + ' files will be renamed.');

  console.log('\nStarting to Process.\n')

  fthingy.process();

  console.log('Done Processing.')
});