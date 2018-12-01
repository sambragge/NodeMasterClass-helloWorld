var enviroments = {};


// staging (default) enviroment
enviroments.staging = {
	'httpPort':3000,
	'httpsPort':3001,
	'envName':'staging'
};

//production enviroment
enviroments.production = {
	'httpPort':5000,
	'httpsPort':5001,
	'envName':'production'
};

//determine which enviroment to use
var currentEnviroment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV : '';

//check if enviroment is defined
var enviromentToExport = typeof(enviroments[currentEnviroment]) == 'object' ? enviroments[currentEnviroment] : enviroments.staging;

module.exports = enviromentToExport;