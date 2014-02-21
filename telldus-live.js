// a node.js module to interface with the Telldus Live API
//   cf., http://api.telldus.com

var events      = require('events')
  , oauth       = require('oauth')
  , querystring = require('querystring')
  , underscore  = require('underscore')
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

TelldusAPI.prototype.getSensorInfo = function(sensor, callback) {
  return this.roundtrip('GET', '/sensor/info?' + querystring.stringify(       { id        : sensor.id }), callback);
};

TelldusAPI.prototype.setSensorName = function(sensor, name, callback) {
  return this.roundtrip('PUT', '/sensor/setName?' + querystring.stringify(    { id        : sensor.id
                                                                              , name      : name }), callback);
};


exports.commands = { on   : 0x0001
                   , off  : 0x0002
                   , bell : 0x0004
                   , dim  : 0x0010
                   , up   : 0x0080
                   , down : 0x0100
                   };
var methods          = underscore.invert(exports.commands)
  , supportedMethods = underscore.reduce(exports.commands, function(memo, num) { return memo + num; }, 0);

TelldusAPI.prototype.getDevices = function(callback) {
  return this.roundtrip('GET', '/devices/list?' + querystring.stringify({ supportedMethods: supportedMethods }),
                        function(err, results) {
    var device, i;

    if (!!err) return callback(err);

    if (!util.isArray(results.device)) return callback(new Error('non-array returned: ' + JSON.stringify(results)));
    for (i = 0; i < results.device.length; i++) {
      device = results.device[i];
      device.status = methods[device.state] || 'off';
    }
    callback(null, results.device);
  });
};

TelldusAPI.prototype.getDeviceInfo = function(device, callback) {
  return this.roundtrip('GET', '/device/info?' + querystring.stringify(       { id               : device.id
                                                                              , supportedMethods : supportedMethods
                                                                              }), function(err, results) {
    if (!!err) return callback(err);

    results.status = methods[results.state] || 'off';
    callback(null, results);
  });
};


TelldusAPI.prototype.addDevice = function(device, clientID, name, protocol, model, callback) {
  return this.roundtrip('POST', '/device/setName?' + querystring.stringify(   { id        : device.id
                                                                              , name      : name
                                                                              , protocol  : protocol
                                                                              , model     : model
                                                                          }), callback);
};

TelldusAPI.prototype.setDeviceLearn = function(device, callback) {
  return this.roundtrip('PUT', '/device/learn?' + querystring.stringify({ id: device.id }), callback);
};

TelldusAPI.prototype.setDeviceModel = function(device, model, callback) {
  return this.roundtrip('PUT', '/device/setModel?' + querystring.stringify(   { id        : device.id
                                                                              , model     : model }), callback);
};

TelldusAPI.prototype.setDeviceName = function(device, name, callback) {
  return this.roundtrip('PUT', '/device/setName?' + querystring.stringify(    { id        : device.id
                                                                              , name      : name }), callback);
};

TelldusAPI.prototype.setDeviceParameter = function(device, parameter, value, callback) {
  return this.roundtrip('PUT', '/device/setParameter?' + querystring.stringify({ id        : device.id
                                                                              , parameter : parameter
                                                                              , value     : value }), callback);
};

TelldusAPI.prototype.setDeviceProtocol = function(device, protocol, callback) {
  return this.roundtrip('PUT', '/device/setProtocol?' + querystring.stringify({ id        : device.id
                                                                              , protocol  : protocol }), callback);
};

TelldusAPI.prototype.removeDevice = function(device, callback) {
  return this.roundtrip('DELETE', '/device/remove?' + querystring.stringify(  { id        : device.id }), callback);
};


TelldusAPI.prototype.bellDevice = function(device, callback) {
  return this.roundtrip('PUT', '/device/bell?' + querystring.stringify(       { id        : device.id }), callback);
};

TelldusAPI.prototype.commandDevice = function(device, method, value, callback) {
  if (!exports.commands[method]) return callback(new Error('unknown method: ' + method));

  return this.roundtrip('PUT', '/device/command?' + querystring.stringify(    { id        : device.id
                                                                              , method    : exports.commands[method]
                                                                              , value     : value }), callback);
};

TelldusAPI.prototype.dimDevice = function(device, level, callback) {
  return this.roundtrip('PUT', '/device/dim?' + querystring.stringify(        { id        : device.id
                                                                              , level     : level }), callback);
};

TelldusAPI.prototype.onOffDevice = function(device, onP, callback) {
  return this.roundtrip('PUT', '/device/turn' + (onP ? 'On' : 'Off') + '?'
                                                      + querystring.stringify({ id        : device.id }), callback);
};

TelldusAPI.prototype.stopDevice = function(device, callback) {
  return this.roundtrip('PUT', '/device/stop?' + querystring.stringify(       { id        : device.id }), callback);
};

TelldusAPI.prototype.upDownDevice = function(device, upP, callback) {
  return this.roundtrip('PUT', '/device/' + (upP ? 'up' : 'down') + '?'
                                                      + querystring.stringify({ id        : device.id }), callback);
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

// NB: not REST
  method = 'GET';
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
