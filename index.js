var FileThingy = require('./lib/filethingy'),
    Util = require('./lib/util'),
    fs = require('fs'),
    optimist = require('optimist');


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
var args = require('optimist').argv;
args.sourceDir = args._[0] || null;
args.targetDir = args._[1] || null;


if (!args.sourceDir) {
  util.help();
} else if (!args.targetDir) {
  util.formatHelp('targetDir', 'missing');
}


/**
 * Initialize FileThingy Class with command line options.
 */
var fthingy = new FileThingy(args);


/**
 * Check if targetDir is writeable, and abort if it is not.
 */
stats = fs.stat(args.targetDir, function(err, stat) {
  // TODO: For now this only checks if it exists...
  if (err) {
    util.formatHelp('targetDir', 'error', args.targetDir);
  }
});


/**
 * Start crawling the Directory(s).
 */
var indexStart = new Date();
fthingy.log.message('Starting to index files and directories.');
fthingy.crawl(args.sourceDir, function(err) {
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
