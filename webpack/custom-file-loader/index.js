const template = require('fs').readFileSync(__dirname + '/template.js').toString();

module.exports = function fallbackLoader (source) {


	if (this.loaders.length !== 1) return source;
	if (this.loaderIndex !== 0) return source;

	// JSON breaks for some reason. it only has one loader, this
	// but it doesnt need to be transformed. the default non-existant
	// loader works fine...
	// js files would likely have the same issue if we weren't babelling them.
	if (this.resourcePath.endsWith('.json')) return source;

	// console.log()
	// console.log(this.resourcePath)
	// console.log('loaders', this.loaders.length)
	// console.log('index', this.loaderIndex)
	// console.log('fallback loading...')

	return template.replace('${content}', `\${${JSON.stringify(source)}}`);
	// return '';
}