var TelldusAPI = require('./telldus-live');

var publicKey   = '...'
  , privateKey  = '...'
  , token       = '...'
  , tokenSecret = '...'
  , cloud
  ;

cloud = new TelldusAPI.TelldusAPI({ publicKey  : publicKey
                                  , privateKey : privateKey }).login(token, tokenSecret, function(err, user) {
  if (!!err) return console.log('login error: ' + err.message);

  console.log('user: '); console.log(user); console.log(''); console.log('');

  cloud.getSensors(function(err, sensors) {
    var f, i;

    if (!!err) return console.log('getSensors: ' + err.message);

    f = function(offset, id) {
      return function(err, sensor) {
        if (!!err) return console.log('getSensorInfo id=' + id + ': ' + err.message);

        console.log('sensor #' + offset + ': '); console.log(sensor); console.log('');
      };
    };

    console.log('sensors: '); console.log(sensors); console.log(''); console.log('');
    for (i = 0; i < sensors.length; i++) cloud.getSensorInfo(sensors[i], f(i, sensors[i].id));
  }).getDevices(function(err, devices) {
    var f, i;

    if (!!err) return console.log('getDevices: ' + err.message);

    f = function(offset, id) {
      return function(err, device) {
        if (!!err) return console.log('getDeviceInfo id=' + id + ': ' + err.message);

        console.log('device #' + offset + ': '); console.log(device); console.log('');
      };
    };

    console.log('devices: '); console.log(devices); console.log(''); console.log('');
    for (i = 0; i < devices.length; i++) cloud.getDeviceInfo(devices[i], f(i, devices[i].id));
  });
}).on('error', function(err) {
  console.log('background error: ' + err.message);
});
