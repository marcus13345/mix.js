const yargs = require('yargs').argv;

if(typeof require('electron') === 'string') {
	console.error('Start app with electron, not node');
	process.exit(1);
}

const { BrowserWindow, app } = require('electron');

app.once('ready', _ => {
	const win = new BrowserWindow({
		show: false,
		webPreferences: {
			nodeIntegration: true,
			webSecurity: false
		}
	});

	win.loadFile(yargs._[0]);
	win.removeMenu();

	win.once('ready-to-show', _ => {
		win.show();
		win.webContents.toggleDevTools();
	})
})