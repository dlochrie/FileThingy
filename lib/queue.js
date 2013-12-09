/**
 * @param {number=} operationLimit Optional operation limit passed in as argument.
 * @constructor
 */
function Queue(operationLimit) {
  this.limit = operationLimit || this.DEFAULT_FILE_LIMIT;
}

/**
 * @const
 * @type {number} Default MAX limit of simultaneously opened operations.
 */
Queue.prototype.DEFAULT_FILE_LIMIT = 100;


/**
 * @type {Array.<function>} Queue of operations to process.
 */
Queue.prototype.queue = []


/**
 * @type {number} Current number of processed operations.
 */
Queue.prototype.openFiles = 0;


/**
 * @type {number} Total number of processed operations.
 */
Queue.prototype.totalFiles = 0;


/**
 * Adds a file operation to the queue.
 * @param {function} fn Function to add to queue.
 * @param {function} cb Function to call when this operation completes.
 */
Queue.prototype.addFile = function(fn, cb) {
  this.queue.push(fn);
  return cb;
};


/**
 * Executes the queue of operations.
 * MIXU 7.2.3
 * @param {function} fn
 * @param {function} cb
 */
Queue.prototype.execute = function() {
  var self = this;

  function async(fn, callback) {
    fn(function() {
      setTimeout(function() {
        callback();
      }, 5000);
    });
  }

  function final() {
    console.log('Done');
  }

  function launcher() {
    while(self.openFiles < self.limit && self.queue.length > 0) {
      var fn = self.queue.shift();
      async(fn, function() {
        self.openFiles--;
        if(self.queue.length > 0) {
          launcher();
        } else if(self.openFiles === 0) {
          final();
        }
      });
      self.openFiles++;
    }
  }

  console.log('Operation Queue Count:' + self.queue.length);
  launcher();
};


module.exports = Queue;