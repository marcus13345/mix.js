const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = class HtmlInjectLiveReload {
	constructor ({
		port = 36000
	} = {}) {
		this.port = port;
		console.log('injecting livereload script for port ' + this.port);
	}

	apply (compiler) {
		compiler.hooks.compilation.tap('HtmlInjectLiveReload', (compilation) => {
			// console.log('The compiler is starting a new compilation...')
			// Static Plugin interface |compilation |HOOK NAME | register listener 
			HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tap(
				'HtmlInjectLiveReload', // <-- Set a meaningful name here for stacktraces
				(data, cb) => {
					// Manipulate the content
					// console.dir();
					const [pre, post] = data.html.split(/(<\/body><\/html>)/g);
					data.html = `${pre}<script async src="http://localhost:${this.port}/livereload.js"></script>${post}`;
				}
			)
		})
	}
}