const rootConfig = require('./../webpack.config');
const { cloneDeep } = require('lodash');
const LiveReloadPlugin = require('webpack-livereload-plugin');
const HtmlInjectLiveReload = require('./../InjectLivereload');

module.exports = {
	...cloneDeep(rootConfig),
	node: {
		fs: 'empty'
	}
};

module.exports.plugins = [
	...module.exports.plugins,
	new LiveReloadPlugin({
		port: 38000
	}),
	new HtmlInjectLiveReload({
		port: 38000
	})
]