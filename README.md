node-telldus-live
=================

A node.js module to interface with the [Telldus Live API](http://api.telldus.com).

Before Starting
---------------
You will need a Telldus Live account and OAuth tokens:

- To get a Telldus Live account, go to [login.telldus.com](https://login.telldus.com)

- Once you have a Telldus Live account, go to [api.telldus.com](http://api.telldus.com/keys/index) and _Generate a private token for my user only_.


Install
-------

    npm install telldus-live

API
---

### Load

    var TelldusAPI = require('telldus-live');

### Login to cloud

    var publicKey    = '...'
      , privateKey   = '...'
      , token        = '...'
      , tokenSecret  = '...'
      , cloud
      ;

    cloud = new TelldusAPI.TelldusAPI({ publicKey  : publicKey
                                      , privateKey : privateKey }).login(function(token, tokenSecret, function(err, user)) {
      if (!!err) return console.log('login error: ' + err.message);

      // otherwise, good to go!
      console.log('user: '); console.log(user);
    }).on('error', function(err) {
      console.log('background error: ' + err.message);
    });

### Get device information

    cloud.getDevices(function(err, devices) {
      if (!!err) return console.log('getDevices: ' + err.message);

      // inspect devices[{}]
    });

    cloud.getDeviceInfo(device, function(err, device) {
      if (!!err) return console.log('getDevice: ' + err.message);

      // inspect device{}
    });

### Create/Modify/Delete device

    cloud.setDeviceName(device, name, function(err, result) {
    });

    cloud.addDevice(device, clientID, name, protocol, model, function(err, result) {
    });

    cloud.setDeviceLearn(device, function(err, result) {
    });

    cloud.setDeviceModel(device, model, function(err, result) {
    });

    cloud.setDeviceName(device, name, function(err, result) {
    });

    cloud.setDeviceParameter(device, parameter, value, function(err, result) {
    });

    cloud.setDeviceProtocol(device, protocol, function(err, result) {
    });

    cloud.removeDevice(device, function(err, result) {
    });



### Device actions

    cloud.bellDevice(device, function(err, result) {
    });

    cloud.commandDevice(device, method, value, function(err, result) {
    });

    cloud.dimDevice(device, level, function(err, result) {
    });

    cloud.onOffDevice(device, onP, function(err, result) {
    });

    cloud.stopDevice(device, function(err, result) {
    });

    cloud.upDownDevice(device, upP, function(err, result) {
    });

### Get sensor information

    cloud.getSensors(function(err, sensors) {
      if (!!err) return console.log('getSensors: ' + err.message);

      // inspect sensors[{}]
    });

    cloud.getSensorInfo(sensor, function(err, sensor) {
      if (!!err) return console.log('getSensor: ' + err.message);

      // inspect sensor{}
    });

### Modify sensor

    cloud.setSensorName(sensor, name, function(err, reuslt) {
    });


Finally
-------

Enjoy!
