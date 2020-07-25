const { existsSync } = require('fs');
const { parse, join } = require('path');
const merge = require('deepmerge')
const defaultConfig = require('./defaults.json');

const CONFIG_NAMES = [
	'app.config.js',
	'valapp.config.js',
	'valapp.config.json'
];

module.exports.found = false;
module.exports.rootDir = process.cwd();
for( const filepath of getFilepaths()) {
	if(existsSync(filepath)) {
		module.exports = merge(defaultConfig, require(filepath));
		module.exports.rootDir = parse(filepath).dir;
		module.exports.found = true;
	}
}


// this is a little nasty, but dw about it
function ascend(startPath) {
	let paths = [];
	for(
		let path = startPath;
		parse(path).name !== ''; // root has no name
		path = parse(path).dir
	) {
		paths.push(path);
	}
	paths.push(parse(startPath).root);
	return paths;
}

function getFilepaths() {
	const filepaths = [];
	for(const path of ascend(process.cwd())) {
		for(const file of CONFIG_NAMES) {
			const filepath = join(path, file);
			filepaths.push(filepath)
		}
	}
	return filepaths;
}