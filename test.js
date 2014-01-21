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

    f = function(offset, p, s) {
      return function(err, sensor) {
        var d, prop, type;

        if (!!err) return console.log(s + ' id=' + p.id + ': ' + err.message);

        console.log('sensor #' + offset + ' ' + s + ': '); console.log(sensor);
        type = null;
        for (d in sensor.data) if (sensor.data.hasOwnProperty(d)) {
          if ((d.name === 'temp') || (d.name === 'humidity')) type = 'meteo';
        }
        console.log('/device/climate' + (sensor.protocol || 'telldus') + '/' + (type || 'generic'));
        console.log('    uuid=teldus:' + sensor.id);
        console.log('    name: ' + sensor.name);
        console.log('    status: ' + (p.online === '1' ? 'present' : 'absent'));
        console.log('    lastSample: ' + sensor.lastUpdated * 1000);
        console.log('    info:');
        for (d in sensor.data) if (sensor.data.hasOwnProperty(d)) {
          prop = { temp : 'temperature' }[d.name] || d.name;
          console.log('      ' + prop + ': ' + d.value);
        }
        console.log('');
      };
    };

    console.log('sensors: '); console.log(sensors); console.log(''); console.log('');
    for (i = 0; i < sensors.length; i++) cloud.getSensorInfo(sensors[i], f(i, sensors[i], 'getSensorInfo'));
  }).getDevices(function(err, devices) {
    var f, i;

    if (!!err) return console.log('getDevices: ' + err.message);

    f = function(offset, p, s) {
      return function(err, device) {
        var d, type;

        if (!!err) return console.log(s + ' id=' + p.id + ': ' + err.message);

        console.log('device #' + offset + ' ' + s + ': '); console.log(device);
        type = null;
        d = device.protocol.split(':');
        type = { 'selflearning-switch' : 'dimmer'
               , codeswitch            : 'onoff' }[d[0]];
        if (!type) return;
        console.log('/device/climate' + (d[d.length - 1] || 'telldus') + '/' + (type || 'generic'));
        console.log('    uuid=teldus:' + device.id);
        console.log('    perform: off, on');
        console.log('    name: ' + device.name);
        console.log('    status: ' + (device.online === '1' ? 'present' : 'absent'));
        console.log('    info:');
        if (type === 'dimmer') console.log('      dimmer: percentage');
        console.log('');
      };
    };

    console.log('devices: '); console.log(devices); console.log(''); console.log('');
    for (i = 0; i < devices.length; i++) {
      if (devices[i].type === 'device') cloud.getDeviceInfo(devices[i], f(i, devices[i], 'getDeviceInfo'));
    }
  });
}).on('error', function(err) {
  console.log('background error: ' + err.message);
});
