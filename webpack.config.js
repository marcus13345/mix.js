const { resolve } = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const CspHtmlWebpackPlugin = require('csp-html-webpack-plugin');
const LiveReloadPlugin = require('webpack-livereload-plugin');

const { 
	livereload = {
		port: 8877
	},
	rootDir,
	entry
} = require('./src/config');

// console.log(require.resolve('babel-loader'));
// 

class HtmlInjectLiveReload {
	apply (compiler) {
		compiler.hooks.compilation.tap('HtmlInjectLiveReload', (compilation) => {
			// console.log('The compiler is starting a new compilation...')
			// Static Plugin interface |compilation |HOOK NAME | register listener 
			HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(
				'HtmlInjectLiveReload', // <-- Set a meaningful name here for stacktraces
				(data, cb) => {
					// Manipulate the content
					// console.dir();
					const pre = data.html.split(/(<\/body><\/html>)/g)[0];
					const post = data.html.split(/(<\/body><\/html>)/g)[1];
					data.html = ''
						+ pre
						+ '<script async src="http://localhost:35729/livereload.js"></script>'
						+ post
					// Tell webpack to move on
					cb(null, data)
				}
			)
		})
	}
}

module.exports = {
	mode: 'production',
	devtool: 'source-map',
	entry: resolve(rootDir, entry),
	performance: { hints: false },
	output: {
		filename: 'index.bundle.js',
		path: resolve(rootDir, 'dist'),
		publicPath: '/' // this is to set scripts to load from root for SPA 404 fallbacks
	},
	plugins: [
		new HtmlWebpackPlugin({
			inject: true,
			cspPlugin: {
				enabled: true,
				policy: {
					'default-src': "'none'",
					'script-src': ["'self'", "http:\/\/localhost:*", "'unsafe-inline'"],
					'img-src': ["https:\/\/*:*", "http:\/\/*:*", "'self'"],
					'media-src': ["https:\/\/*:*", "http:\/\/*:*"],
					'connect-src': ["http:\/\/*:*", "ws:\/\/localhost:35729"],
					'style-src-elem': ["'self'", "'unsafe-inline'"],
					'style-src': ["'self'", "'unsafe-inline'"],
					'font-src': 'data:'
				}
			}
		}),
		// new CspHtmlWebpackPlugin({}, {}),
		new LiveReloadPlugin({}),
		new HtmlInjectLiveReload({ options: '' })
	],
	module: {
		rules: [
			{
				test: /\.html$/i,
				loader: require.resolve('html-loader'),
			},
			{
				test: /\.css$/i,
				use: require.resolve('css-loader'),
			},
			{
				test: /\.(png|jpe?g|gif)$/i,
				use: [
					{
						loader: require.resolve('file-loader'),
					},
				],
			},
			{
				test: /\.m?js$/,
				exclude: /(node_modules|bower_components)/,
				use: {
					loader: require.resolve('babel-loader'),
					options: {
						// presets: ['@babel/preset-env'],
						plugins: [
							require.resolve('babel-plugin-transform-class-properties')
						]
					}
				}
			},
			{
				test: /\.md$/,
				use: [
					{
						loader: require.resolve("html-loader")
					},
					{
						loader: require.resolve("markdown-loader"),
						options: {
								/* your options here */
						}
					}
				]
			}
		],
	}
}