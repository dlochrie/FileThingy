


/**
 * @constructor
 */
function Util() {}


/**
 * @enum {.<string>}
 */
Util.prototype.OPTIONS = {
  'recipe': {
    name: 'Recipe',
    description: 'JSON file describing file and directory renaming rules.',
    missing: 'Option for Recipe called, but no Recipe file was specified.',
    error: 'Could not find or use the Recipe file you specified. It must be ' +
        'valid JSON, and the path should be readable/reachable.',
    usage: 'node FileThingy /PATH/TO/READ/ /THE/PATH/TO/TARGET/DIR/ ' +
        '-recipe=/path/to/recipe.json'
  },
  'targetDir': {
    name: 'Target Directory',
    description:
        'The directory that will contain the new files and directories.',
    missing:
        'A Target Directory MUST be provided.',
    error: 'Could not find or write to Target directory you specified. The ' +
        'full path should be writable/reachable/readable.',
    usage: 'node FileThingy /PATH/TO/READ/ /THE/PATH/TO/TARGET/DIR/'
  }
};


/**
 * Adds a slash at the end if it doesn't have one.
 * @param {string} string String to add slash to.
 * @return {string} The string with a trailing slash added.
 */
Util.prototype.addSlash = function(string) {
  return (string.slice(-1) !== '/') ? string + '/' : string;
};


/**
 * Removes the slash at the end if it hase one.
 * @param {string} string String to remove the slash from.
 * @return {string} The string with trailing slash removed.
 */
Util.prototype.chopSlash = function(string) {
  return (string.slice(-1) !== '/') ? string :
      string.substring(0, string.length - 1);
};


/**
 * Throws an Error with the message.
 * @param {string} msg Message to print with error.
 */
Util.prototype.complain = function(msg) {
  throw new Error(msg + '\n\nStack Trace:\n');
};


/**
 * Calculates the difference in seconds. Used to calculate execution time.
 * @param {?number} from "From" Time to check in caluclate total time.
 * @return {number|string}
 */
Util.prototype.getExecutionTime = function(from) {
  if (!from || this.isNum(from)) {
    return 'N/A';
  }
  return (Math.floor((new Date() - from)) / 1000).toFixed(2);
};


/**
 * Really nice and concise number validation take from here:
 * http://stackoverflow.com/a/1830844/1058612
 * @param {*} n Number (or anything) to validate.
 * @return {boolean} If the argument is a number or not.
 */
Util.prototype.isNum = function(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
};


/**
 * Prints a help message to the command line.
 * TODO: Should be using `optimist` to do this.
 */
Util.prototype.help = function() {
  console.log('FileThingy Help:');
  console.log('\nUsage: node THISFILE [SOURCE_DIR] [OPTIONS]');
  console.log('\nOptions:');
  console.log('\t-r, --recipe\t\tPath to file containing recipes.');
  console.log('\t-f, --flat\t\tKeep the source directory flat, and move all ' +
      'nested directories to the root level.');
  console.log('\tOther...\t\tOther');
  console.log('\n');
  process.exit();
};


/**
 * Prints a custom help message based on the values passed.
 * TODO: Should be using `optimist` to do this.
 * @param {string} option Flag or argument passed on command line.
 * @param {string} kind The kind of value that passed, ie File, Directory, etc.
 * @param {string} value The value of the kind that was passed, ie the name of
 *     the file, path to the directory, etc.
 */
Util.prototype.formatHelp = function(option, kind, value) {
  var available = Object.keys(this.OPTIONS);
  if (available.indexOf(option) === -1) {
    console.log('This option is unavailable:\t' + option);
    this.help;
  }

  var o = this.OPTIONS[option];
  console.log('There was an error with the ' + o.name + ':');
  console.log('\n\t[' + kind + '] ' + o[kind]);
  if (value) {
    console.log('\t' + o.name + ' provided:\t' + value);
  }
  console.log('\n' + o.name + ' Information and Usage:\n');
  console.log('\tDesciption:\t' + o.description);
  console.log('\tUsage:\t' + o.usage + '\n');
  process.exit();
};


/**
 * @expose
 * Expose Util Class.
 */
module.exports = Util;
