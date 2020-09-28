const { resolve } = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const CspHtmlWebpackPlugin = require('csp-html-webpack-plugin');

const { 
	livereload = {
		port: 8877
	},
	rootDir,
	entry
} = require('../src/config');

// console.log(require.resolve('babel-loader'));
// 

module.exports = {
	mode: 'production',
	devtool: 'inline-source-map', // inline because electron has trouble loading external over file://
	entry: resolve(rootDir, entry),
	performance: { hints: false },
	output: {
		filename: 'index.bundle.js',
		path: resolve(rootDir, 'dist'),
		publicPath: '/', // this is to set scripts to load from root for SPA 404 fallbacks
		// sourceMapFilename: "/index.bundle.js.map"
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
		})
		// new CspHtmlWebpackPlugin({}, {}),
	],
	module: {
		rules: [
			{
				// backup loader ... honestly this is an incantation,
				// anything that doesnt have 'js' in its extension
				// because for some reason js files are getting through
				// without being babelled
				// test: /\.[^.]*(?:(?!js))[^.]*$/i,
				// NVM NOW WE JUST IGNORE NODE_MODULES LOL I GUESS HAHAHAHAHAH

				test: /\.[^.]*$/i,
				exclude: /(node_modules|bower_components)/,
				use: [
					{
						loader: require.resolve('./custom-file-loader'),
					},
				],
			},
			{
				test: /\.(html)$/i,
				loader: require.resolve('html-loader'),
			},
			{
				test: /\.css$/i,
				loader: require.resolve('css-loader'),
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
			},
		],
	}
}