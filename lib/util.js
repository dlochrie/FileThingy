/**
 * @constructor
 */
function Util() {}


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
  return (Math.floor((new Date()-from)) / 1000).toFixed(2);
}


/**
 * Really nice and concise number validation take from here:
 * http://stackoverflow.com/a/1830844/1058612
 * @param {*} Number (or anything) to validate.
 * @return {boolean} If the argument is a number or not.
 */
Util.prototype.isNum = function(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}


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


module.exports = Util;