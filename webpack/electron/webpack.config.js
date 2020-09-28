const rootConfig = require('./../webpack.config');
const { cloneDeep } = require('lodash');
const LiveReloadPlugin = require('webpack-livereload-plugin');
const HtmlInjectLiveReload = require('./../InjectLivereload');

module.exports = {
	...cloneDeep(rootConfig),
	externals: {
		'fs': 'commonjs fs',
		'events': 'commonjs events',
		'path': 'commonjs path',
		'util': 'commonjs util',
		'stream': 'commonjs stream',
		'constants': 'commonjs constants',
		'assert': 'commonjs assert',
		'os': 'commonjs os'
	},
	target: 'electron-renderer',
	node: false,
}

module.exports.plugins = [
	...module.exports.plugins,
	new LiveReloadPlugin({
		port: 37000
	}),
	new HtmlInjectLiveReload({
		port: 37000
	})
]
