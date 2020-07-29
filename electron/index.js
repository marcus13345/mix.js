const yargs = require('yargs').argv;
const config = require('../src/config');
const { resolve, normalize, parse } = require('path');
const CONTENT_ROOT = normalize(resolve(config.rootDir, 'dist'));
const { format } = require('url')

if(typeof require('electron') === 'string') {
	console.error('Start app with electron, not node');
	process.exit(1);
}

const { BrowserWindow, app, protocol } = require('electron');

app.once('ready', _ => {
	const win = new BrowserWindow({
		show: false,
		webPreferences: {
			nodeIntegration: true,
			webSecurity: false
		},
	});

	protocol.interceptFileProtocol('file', (request, callback) => {
		let url = request.url.substr('file'.length + 4);
		
		url = resolve(CONTENT_ROOT, url);

		// console.log(url);
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