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

    f = function(offset, id, s) {
      return function(err, sensor) {
        if (!!err) return console.log(s + ' id=' + id + ': ' + err.message);

        console.log('sensor #' + offset + ' ' + s + ': '); console.log(sensor); console.log('');
      };
    };

    console.log('sensors: '); console.log(sensors); console.log(''); console.log('');
    for (i = 0; i < sensors.length; i++) cloud.getSensorInfo(sensors[i], f(i, sensors[i].id, 'getSensorInfo'));

    var sensor;
    for (i = 0; i < sensors.length; i++) {
      sensor = sensors[i];
      if (sensor.id === '847133') {
        cloud.setSensorName(sensor, (sensor.name === 'Garaget - ute' ? 'The garage - out' : 'Garaget - ute'),
                            f(i,sensors[i].id, 'setSensorName'));
      } else if (sensor.id === '115423') {
        cloud.setSensorName(sensor, (sensor.name === 'Väderstationen' ? 'Weather Station' : 'Väderstationen'),
                            f(i,sensors[i].id, 'setSensorName'));
      }
      cloud.getSensorInfo(sensors[i], f(i, sensors[i].id));
    }
  }).getDevices(function(err, devices) {
    var f, i;

    if (!!err) return console.log('getDevices: ' + err.message);

    f = function(offset, id, s) {
      return function(err, device) {
        if (!!err) return console.log(s + ' id=' + id + ': ' + err.message);

        console.log('device #' + offset + ' ' + s + ': '); console.log(device); console.log('');
      };
    };

    console.log('devices: '); console.log(devices); console.log(''); console.log('');
    for (i = 0; i < devices.length; i++) cloud.getDeviceInfo(devices[i], f(i, devices[i].id, 'getDeviceInfo'));

    var device;
    for (i = 0; i < devices.length; i++) {
      device = devices[i];
      if (device.id === '127878') {
        cloud.setDeviceName(device, (device.name === 'Inne 10' ? 'Inside 10' : 'Inne 10'),
                            f(i,devices[i].id, 'setDeviceName'));
      } else if (device.id === '127875') {
        cloud.setDeviceName(device, (device.name === 'Inne: Vardagsrum fönster' ? 'Inside: Living romo window'
                                                                                : 'Inne: Vardagsrum fönster'),
                            f(i,devices[i].id, 'setDeviceName'));
      }
      cloud.getDeviceInfo(devices[i], f(i, devices[i].id));
    }
  });
}).on('error', function(err) {
  console.log('background error: ' + err.message);
});
