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
Queue.prototype.DEFAULT_FILE_LIMIT = 200;


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
 * @param {function} fn
 * @param {function} cb
 */
Queue.prototype.execute = function(done) {
  this.openFiles = 0; // Reset limit.
  var self = this;

  for (var i = 0, count = this.queue.length; i < count; i++) {
    var fn = this.queue[i];
    if (fn) {
      fn(function(blah) {
        self.openFiles++;
        self.totalFiles++;
        if (self.totalFiles === self.queue.length) {
          return done();
        } else if (self.openFiles === self.limit) {
          console.log('Total Processed:\t', self.totalFiles);
          self.execute();
        }
      });
    }
  }


  // this.queue.forEach(function(callback, index) {
  //   if (!callback) {
  //     console.log(self.openFiles)
  //     return;
  //   }
  //   callback(function() {
  //     results[index] = Array.prototype.slice.call(arguments);
  //     result_count++;
  //     if (result_count === self.queue.length) {
  //       done(results);
  //     }
  //   })
  // });
};


module.exports = Queue;