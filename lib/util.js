/**
 * @constructor
 */
function Util() {}


Util.prototype.complain = function(msg) {
  throw new Error(msg + '\n\nStack Trace:\n');
};


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