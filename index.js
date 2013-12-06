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


/**
 * Start crawling the Directory(s).
 */
fthingy.walk(sourceDir, function(err, results) {
  if (err) return process.sterr(err);
  fthingy.process();
  console.log('\n---------------------------------------------')
  console.log(fthingy.discarded_)
  console.log('\n---------------------------------------------')
});