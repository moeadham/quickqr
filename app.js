var Zbar = require('./zbar');



var express = require('express');

// the REST server instance
var server = express();
server.set('title', 'NodeJS REST Server');

// simple logger
server.use(function(req, res, next){
    console.log('%s %s', req.method, req.url);
    next();
});

// API routes
var zbar;

server.get('/scanQR', function(req, res){
	var reply = true;
	zbar = new Zbar('/dev/video0');
	zbar.stdout.on('data', function(buf) {
  		if(reply){
  			
  			reply = false;
  			zbar.kill('SIGHUP');
  			var buffer = buf.toString();
  			buffer = buffer.replace(/^\s+|\s+$/g, '');
  			var result = {qr: buffer};
  			res.send(result);
  		}
	});
	zbar.on('close',function(code){
		if(reply){
			var result = {error: true};	
			res.send(result);
		}
	});
});

server.get('/cancel', function(req, res){
	if(zbar){
		zbar.kill('SIGHUP');
		var result = {error: false};
		res.send(result);
	} else {
		var result = {error: true};
		res.send(result);
	}
});

server.listen(process.env.PORT || 8003, function() {
  console.log('"%s" listening at localhost:%s', server.name, process.env.PORT);
});

/*zbar.on('error', function(buf) {
  console.log(buf.toString());
});*/


