var express = require('express');
var TelldusAPI = require('./telldus-live');
var logger = require('morgan');
var parser = require('body-parser');
var secrets = require('./secrets.js').Secrets;

console.log(secrets);


var publicKey   = secrets.publicKey
  , privateKey  = secrets.privateKey
  , token       = secrets.token
  , tokenSecret = secrets.tokenSecret
  , port = '8080'
  , cloud
  ;


var app = express();

// router: clients
app.get('/clients', function(req, res) {
  cloud = TelldusAPI.TelldusAPI({ publicKey  : publicKey, privateKey : privateKey }).login(token, tokenSecret, function(err, user) {
    if (!!err) return console.log('login error: ' + err.message);
  
    cloud.getClients(function(err, clients) {
      res.json(clients);  
    });
  }).on('error', function(err) {
    console.log('background error: ' + err.message);
  });
});

app.get('/clients/:id', function(req, res) {
  cloud = TelldusAPI.TelldusAPI({ publicKey  : publicKey, privateKey : privateKey }).login(token, tokenSecret, function(err, user) {
    if (!!err) return console.log('login error: ' + err.message);
    
    var paramClient = { id: req.params.id };
  
    cloud.getClientInfo(paramClient, function(err, client) {
      res.json(client);  
    });
  }).on('error', function(err) {
    console.log('background error: ' + err.message);
  });    
}); 

// router: sensors
app.get('/sensors', function(req, res) {
  cloud = TelldusAPI.TelldusAPI({ publicKey  : publicKey, privateKey : privateKey }).login(token, tokenSecret, function(err, user) {
    if (!!err) return console.log('login error: ' + err.message);
  
    cloud.getSensors(function(err, sensors) {
      res.json(sensors);  
    });
  }).on('error', function(err) {
    console.log('background error: ' + err.message);
  });
});

app.get('/sensors/:id', function(req, res) {
  cloud = TelldusAPI.TelldusAPI({ publicKey  : publicKey, privateKey : privateKey }).login(token, tokenSecret, function(err, user) {
    if (!!err) return console.log('login error: ' + err.message);
  
    var paramSensor = { id: req.params.id };
  
    cloud.getSensorInfo(paramSensor, function(err, sensor) {
      res.json(sensor);  
    });
  }).on('error', function(err) {
    console.log('background error: ' + err.message);
  });    
});

// router: device
app.get('/devices', function(req, res) {
  cloud = TelldusAPI.TelldusAPI({ publicKey  : publicKey, privateKey : privateKey }).login(token, tokenSecret, function(err, user) {
    if (!!err) return console.log('login error: ' + err.message);
  
    cloud.getDevices(function(err, devices) {
      res.json(devices);  
    });
  }).on('error', function(err) {
    console.log('background error: ' + err.message);
  });
});

app.get('/devices/:id', function(req, res) {
  cloud = TelldusAPI.TelldusAPI({ publicKey  : publicKey, privateKey : privateKey }).login(token, tokenSecret, function(err, user) {
    if (!!err) return console.log('login error: ' + err.message);
  
    var paramDevice = { id: req.params.id };
  
    cloud.getDeviceInfo(paramDevice, function(err, device) {
      res.json(device);  
    });
  }).on('error', function(err) {
    console.log('background error: ' + err.message);
  });    
}); 

app.put('/devices/:id/on', function(req, res) {
  cloud = TelldusAPI.TelldusAPI({ publicKey  : publicKey, privateKey : privateKey }).login(token, tokenSecret, function(err, user) {
    if (!!err) return console.log('login error: ' + err.message);
  
    var paramDevice = { id: req.params.id };
  
    cloud.onOffDevice(paramDevice, "On", function(err, device) {
      res.json(device);  
    });
  }).on('error', function(err) {
    console.log('background error: ' + err.message);
  });    
});

app.get('/devices/:id/off', function(req, res) {
  cloud = TelldusAPI.TelldusAPI({ publicKey  : publicKey, privateKey : privateKey }).login(token, tokenSecret, function(err, user) {
    if (!!err) return console.log('login error: ' + err.message);
  
    var paramDevice = { id: req.params.id };
    console.log(paramDevice);
  
    cloud.onOffDevice(paramDevice, "Off", function(err, device) {
      res.json(device);  
    });
  }).on('error', function(err) {
    console.log('background error: ' + err.message);
  });    
});
  
var server = app.listen(port, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
 
