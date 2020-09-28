const template = require('fs').readFileSync(__dirname + '/template.js').toString();

module.exports = function fallbackLoader (source) {


	if (this.loaders.length !== 1) return source;
	if (this.loaderIndex !== 0) return source

	// console.log()
	// console.log(this.resourcePath)
	// console.log('loaders', this.loaders.length)
	// console.log('index', this.loaderIndex)
	// console.log('fallback loading...')

	return template.replace('${content}', `\${${JSON.stringify(source)}}`);
	// return '';
}