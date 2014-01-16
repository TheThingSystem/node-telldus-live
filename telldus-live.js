// telldus-live.js
//   cf., http://api.telldus.com

var events      = require('events')
  , oauth       = require('oauth')
  , util        = require('util')
  ;


var DEFAULT_LOGGER = { error   : function(msg, props) { console.log(msg); if (!!props) console.log(props);             }
                     , warning : function(msg, props) { console.log(msg); if (!!props) console.log(props);             }
                     , notice  : function(msg, props) { console.log(msg); if (!!props) console.log(props);             }
                     , info    : function(msg, props) { console.log(msg); if (!!props) console.log(props);             }
                     , debug   : function(msg, props) { console.log(msg); if (!!props) console.log(props);             }
                     };


var TelldusAPI = function(options) {
  var k;

  var self = this;

  if (!(self instanceof TelldusAPI)) return new TelldusAPI(options);

  self.options = options;

  self.logger = self.options.logger  || {};
  for (k in DEFAULT_LOGGER) {
    if ((DEFAULT_LOGGER.hasOwnProperty(k)) && (typeof self.logger[k] === 'undefined'))  self.logger[k] = DEFAULT_LOGGER[k];
  }
};
util.inherits(TelldusAPI, events.EventEmitter);


TelldusAPI.prototype.login = function(token, tokenSecret, callback) {
  var self = this;

  if (typeof callback !== 'function') throw new Error('callback is mandatory for login');

  self.oauth = new oauth.OAuth(null, null, self.options.publicKey, self.options.privateKey, '1.0', null, 'HMAC-SHA1');
  self.token = token;
  self.tokenSecret = tokenSecret;

  self.invoke('GET', '/user/profile', function(err, code, results) {
    if (!!err) return callback(err);

    callback(null, results);
  });

  return self;
};


TelldusAPI.prototype.getSensors = function(callback) {
  return this.roundtrip('GET', '/sensors/list', function(err, results) {
    if (!!err) return callback(err);

    if (!util.isArray(results.sensor)) return callback(new Error('non-array returned: ' + JSON.stringify(results)));
    return callback(null, results.sensor);
  });
};

TelldusAPI.prototype.getSensorInfo = function(id, callback) {
  return this.roundtrip('GET', '/sensor/info?id=' + id, function(err, results) {
    if (!!err) return callback(err);

// not sure what is returned here...
    return callback(null, results);
  });
};

TelldusAPI.prototype.getDevices = function(callback) {
  return this.roundtrip('GET', '/devices/list', function(err, results) {
    if (!!err) return callback(err);

    if (!util.isArray(results.device)) return callback(new Error('non-array returned: ' + JSON.stringify(results)));
    return callback(null, results.device);
  });
};

TelldusAPI.prototype.getDeviceInfo = function(id, callback) {
  return this.roundtrip('GET', '/device/info?id=' + id, function(err, results) {
    if (!!err) return callback(err);

// not sure what is returned here...
    return callback(null, results);
  });
};


TelldusAPI.prototype.roundtrip = function(method, path, json, callback) {
  var self = this;

  if ((!callback) && (typeof json === 'function')) {
    callback = json;
    json = null;
  }

  return self.invoke(method, path, json, function(err, code, results) {
    callback(err, results);
  });
};

TelldusAPI.prototype.invoke = function(method, path, json, callback) {
  var self = this;

  if ((!callback) && (typeof json === 'function')) {
    callback = json;
    json = null;
  }
  if (!callback) {
    callback = function(err, results) {
      if (!!err) self.logger.error('invoke', { exception: err }); else self.logger.info(path, { results: results });
    };
  }

  self.oauth._performSecureRequest(self.token, self.tokenSecret, method, 'https://api.telldus.com/json' + path, null, json,
                                   !!json ? 'application/json' : null, function(err, body, response) {
      var expected = { GET    : [ 200 ]
                     , PUT    : [ 200 ]
                     , POST   : [ 200, 201, 202 ]
                     , DELETE : [ 200 ]
                     }[method];

      var results = {};

      if (!!err) return callback(err, response.statusCode);

      try { results = JSON.parse(body); } catch(ex) {
        self.logger.error(path, { event: 'json', diagnostic: ex.message, body: body });
        return callback(ex, response.statusCode);
      }

      if (expected.indexOf(response.statusCode) === -1) {
         self.logger.error(path, { event: 'https', code: response.statusCode, body: body });
         return callback(new Error('HTTP response ' + response.statusCode), response.statusCode, results);
      }

      callback(null, response.statusCode, results);

  });

  return self;
};


exports.TelldusAPI = TelldusAPI;
