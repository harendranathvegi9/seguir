/**
 * A worker will listen for jobs on the job queue, and execute them.
 */
var async = require('async');

function bootstrapWorker (api, config, next) {

  var follower = function (cb) {
    api.messaging.listen('seguir-publish-to-followers', function (data, next) {
      api.feed.insertFollowersTimeline(data, next);
    }, cb);
  };

  var mentions = function (cb) {
    api.messaging.listen('seguir-publish-mentioned', function (data, cb) {
      api.feed.insertMentionedTimeline(data, cb);
    }, cb);
  };

  async.series([
    follower,
    mentions
  ], function () {
    console.log('Seguir worker ready for work ...');
    return next && next();
  });

}

/* istanbul ignore if */
if (require.main === module) {
  var config = require('../config')();
  require('../../api')(config, function (err, api) {
    if (err) { return process.exit(0); }
    bootstrapWorker(api, config);
  });
} else {
  // Used for testing
  module.exports = function (config, next) {
    require('../../api')(config, function (err, api) {
      if (err) {
        return next(new Error('Unable to bootstrap API: ' + err.message));
      }
      return bootstrapWorker(api, config, next);
    });
  };
}
