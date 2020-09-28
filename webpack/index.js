const { resolve } = require('path');

module.exports.getTargetConfig = function getTargetConfig(target) {
	const config = require(`./${target}/webpack.config.js`);
	config.output.path = resolve(config.output.path, target);
	return config;
}