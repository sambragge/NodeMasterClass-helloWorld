//native dependencies
const http = require('http'),
	https = require('https'),
	url = require('url'),
	stringDecoder = require('string_decoder').StringDecoder,
	fs = require('fs');

//enviroment variables
const config = require('./config')

// Init HTTP server
const httpServer = http.createServer(function(req, res){
	serverLogic(req, res);
});

//start HTTP server
httpServer.listen(config.httpPort, function(){
	console.log('http server running in '+config.envName+' enviroment and listining on port ', config.httpPort)
});

// init HTTPS server
const httpsServerOptions = {
	'key':fs.readFileSync('./https/key.pem'),
	'cert':fs.readFileSync('./https/cert.pem')
}
const httpsServer = https.createServer(httpsServerOptions, function(req, res){
	serverLogic(req, res);
})

// start HTTPS server
httpsServer.listen(config.httpsPort, function(){
	console.log('https server running in '+config.envName+' enviroment and listining on port ', config.httpsPort)
})

// server logic
function serverLogic(req, res){
		// get url
	const parsedUrl = url.parse(req.url, true);

	//get path
	const path = parsedUrl.pathname;
	const trimmedPath = path.replace(/^\/+|\/+$/g, '');

	//get method
	const method = req.method.toLowerCase();

	//get query string as an onject
	const queryStringObject = parsedUrl.query;

	//get headers as an object
	const headers = req.headers;

	//get the payload if there is one
	const decoder = new stringDecoder('utf-8');
	var buffer = '';
	req.on('data', function(data){
		buffer += decoder.write(data)
	});
	req.on('end', function(){
		buffer += decoder.end()

		// get handler
		const chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ?
		router[trimmedPath]:
		handlers.notFound;

		//construct data object
		const data = {
			'trimmedPath':trimmedPath,
			'queryStringObject':queryStringObject,
			'method':method,
			'headers':headers,
			'payload':buffer
		}

		// log client request
		console.log('client made a '+method+' request\n to path '+trimmedPath+'\n with query string paramaters as '+JSON.stringify(queryStringObject)+'\n and headers as '+JSON.stringify(headers)+'\n and the payload as: '+buffer);

		// call the handler
		chosenHandler(data,function(statusCode,payload){
			//use status code called by handler, or default to 200
			statusCode = typeof(statusCode) == 'number'?statusCode:200;

			//use payload called by the handler, or default to empty object
			payload = typeof(payload) == 'object'?payload:{};

			//convert payload to a string
			const payloadString = JSON.stringify(payload);

			//log server response
			console.log('server responding with status code: '+statusCode+'\n and payload as: '+payloadString);

			//send response
			res.setHeader('Content-Type', 'application/json');
			res.writeHead(statusCode);
			res.end(payloadString);

		});
	});
}

//define handlers
var handlers = {};
handlers.ping = function(data,callback){
	callback(200);
};
handlers.notFound = function(data,callback){
	callback(404)
}

//define router
var router = {
	'ping':handlers.ping,
};