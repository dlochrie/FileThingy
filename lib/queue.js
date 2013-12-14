


/**
 * @param {number=} opt_operationLimit Optional operation limit passed in as an
 *     argument.
 * @constructor
 */
function Queue(opt_operationLimit) {
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
Queue.prototype.queue = [];


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
 * @return {function} Callback function.
 */
Queue.prototype.addFile = function(fn, cb) {
  this.queue.push(fn);
  return cb;
};


/**
 * Executes the queue of operations.
 * See the MIXU Node JS guide, section 7.2.3 for Flow Control.
 * @param {function(<string>)} done Callback function to fire when done.
 */
Queue.prototype.execute = function(done) {
  var self = this;

  function async(fn, callback) {
    fn(function() {
      /**
       * This timeout is set to half a second to help overcome the EMFILE
       * maximum open files errors that occur at the OS level.
       * If needs be, a flag can be created in the future so that a user can
       * specify how much time to wait between "batches." The actual timeout
       * has been set arbitrarily, and exists to "compliment" the FILE LIMIT.
       */
      setTimeout(function() {
        callback();
      }, 500);
    });
  }

  function end() {
    done('Done renaming/moving files.');
  }

  function start() {
    while (self.openFiles < self.limit && self.queue.length > 0) {
      var fn = self.queue.shift();
      async(fn, function() {
        self.openFiles--;
        if (self.queue.length > 0) {
          start();
        } else if (self.openFiles === 0) {
          end();
        }
      });
      self.openFiles++;
    }
  }

  /**
   * Start the queue.
   */
  start();
};


module.exports = Queue;
