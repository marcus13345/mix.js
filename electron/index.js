const yargs = require('yargs').argv;
const config = require('../src/config');
const { resolve, normalize, parse } = require('path');
const CONTENT_ROOT = normalize(resolve(config.rootDir, 'dist', 'electron'));
const { format } = require('url');
const options = config.electron || {};

if(typeof require('electron') === 'string') {
	console.error('Start app with electron, not node');
	process.exit(1);
}

const { BrowserWindow, app, protocol } = require('electron');

app.once('ready', _ => {
	const win = new BrowserWindow({
		show: false,
		width: (options.width + 16) || 800,
		height: (options.height + 39) || 600,
		webPreferences: {
			nodeIntegration: true,
			webSecurity: false
		},
	});

	protocol.interceptFileProtocol('file', (request, callback) => {
		console.log('file request << ', request.url)
		let url = request.url.substr('file'.length + 4);
		
		//just ignore query params...
		url = url.split('?')[0];
		if(url.endsWith('/')) url = url.substr(0, url.length - 1);

		url = resolve(CONTENT_ROOT, url);

		console.log('file sending >> ', url)
		callback({
			path: url
		});
	});

	win.loadURL('file:///index.html');

	win.removeMenu();

	win.once('ready-to-show', _ => {
		win.show();
		win.webContents.toggleDevTools();
	})
})