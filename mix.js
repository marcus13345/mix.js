#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const { resolve } = require('path');
const { writeFileSync, readFileSync, mkdirSync, appendFileSync } = require('fs');
const config = require('./src/config');
const webpack = require('webpack');
const concurrently = require('concurrently');
const electronPath = require('electron');
const supervisor = require('supervisor');
const express = require('express');
const { getTargetConfig } = require('./webpack');
const TARGETS = ['electron', 'webapp'];
const { grey } = require('chalk');
// const globalLog = require('signale');

// webpack keeps running even after we close it...
// const closables = [];
function killAll(code) {
	process.exit(code)
	// for(const closable of closables) {
	//   console.dir(closable.close);
	//   closable.close();
	// }
}

// HACK little hack to remove Terminate batch job (Y/N)?
function indefiniteProcess() {
	if(process.platform === 'win32') {
		process.stdin.setRawMode(true);
		process.stdin.resume();
		process.stdin.setEncoding('utf8');
		process.stdin.on('data', function (key) {
			// process.stdout.write('Get Chunk: ' + key + '\n');
			if (key === '\u0003') killAll();
		});
	}
}

function printStats(target, err, stats) {
	let output = '';
	if(!stats) return;
	if(stats.hasErrors()) {
		for(const err of stats.compilation.errors) {
			output = err.toString();
		}
	} else {
		output = stats.toString({
			colors: true
		});
	}
	output = grey(target) + ' ' + output.replace(/\n/g, `\n${grey(target)} `);
	console.log(output)
}

function compile() {
	for(const target of TARGETS) {
		const config = getTargetConfig(target);
		console.log(config.output.path);
		const compiler = webpack(config)
		compiler.run(printStats.bind(this, target));
	}
}

function hotCompile() {
	for(const target of TARGETS) {
		const compiler = webpack(getTargetConfig(target));
		const closable = compiler.watch({}, printStats.bind(this, target));
	}
}

function electron() {
	spawn(electronPath, [
		resolve(__dirname, 'electron')
	], {
		stdio: 'inherit',
		env: {
			...process.env,
			ELECTRON_DISABLE_SECURITY_WARNINGS: 'true'
		}
	}).on('exit', _ => killAll(0));
}

function test() {
	indefiniteProcess();
	hotCompile();
	serve();
}

function superviseServices() {
	for(const [serviceName, options] of Object.entries(config.services)) {
		const entry = resolve(config.rootDir, options.entry);
		supervisor.run([
			'-w',
			entry,
			'-q',
			'-n',
			'exit',
			entry
		])
	}
}

function serve() {
	const app = express();
	app.use(express.static(resolve(config.rootDir, 'dist/webapp')));
	app.use((req, res) => {
		res.end(readFileSync(resolve(config.rootDir, 'dist/webapp/index.html')))
	})

	app.listen(8080);
}

function dev() {
	indefiniteProcess();
	hotCompile();
	electron();
	superviseServices();
	serve();
}

function init() {
	writeFileSync(resolve(process.cwd(), 'app.config.js'), readFileSync(resolve(__dirname, './defaults/app.config.js')));
	try {
		mkdirSync(resolve(process.cwd(), 'src'));
	} catch (e) {
		'';
	}
	writeFileSync(resolve(process.cwd(), 'src/app.js'), readFileSync(resolve(__dirname, './defaults/src/app.js')));
}

//TODO split this into its own thing man, its messy
function create(args) {
	const [type, ...name] = args._.slice(1);
	const prefix = (config.prefix || 'app') + (type === 'p' ? '-page' : '');
	kebabCase = [prefix, ...name].join('-').toLowerCase();
	console.log('kebab', kebabCase);
	upperCamelCase = kebabCase.split('-').map(v => v[0].toUpperCase() + v.substr(1).toLowerCase()).join('');
	console.log('camel', upperCamelCase);

	switch(type) {
		case 'element':
		case 'e': {
			try {
				mkdirSync(resolve(config.rootDir, 'src'));
			} catch (e) {
				'';
			}
			try {
				mkdirSync(resolve(config.rootDir, 'src', 'elements'));
				writeFileSync(resolve(config.rootDir, 'src', 'elements', 'index.js'), '');
			} catch (e) {
				'';
			}
			writeFileSync(resolve(config.rootDir, 'src', 'elements', `${kebabCase}.js`),
`import { LitElement, html, css } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html'

class ${upperCamelCase} extends LitElement {
	static get styles() {
		return css\`
			
		\`;
	}

	render() {
		return html\`
			Auto-Generated Element
		\`;
	}
}

customElements.define('${kebabCase}', ${upperCamelCase});
`
			);

			appendFileSync(resolve(config.rootDir, 'src', 'elements', 'index.js'), `import './${kebabCase}.js';\n`);
			break;
		}

		case 'page':
		case 'p': {
			try {
				mkdirSync(resolve(config.rootDir, 'src'));
			} catch (e) {
				'';
			}
			try {
				mkdirSync(resolve(config.rootDir, 'src', 'pages'));
				writeFileSync(resolve(config.rootDir, 'src', 'pages', 'index.js'), '');
			} catch (e) {
				'';
			}
			writeFileSync(resolve(config.rootDir, 'src', 'pages', `${kebabCase}.js`),
`import { LitElement, html, css } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html'

class ${upperCamelCase} extends LitElement {
	static get styles() {
		return css\`
			
		\`;
	}

	render() {
		return html\`
			Auto-Generated Page
		\`;
	}
}

customElements.define('${kebabCase}', ${upperCamelCase});
`
			);

			appendFileSync(resolve(config.rootDir, 'src', 'pages', 'index.js'), `import './${kebabCase}.js';\n`);
			break;
		}
	}
}

require('yargs') // eslint-disable-line
	.locale('en')
	.command({
		command: 'compile', // <required> [optional]
		aliases: [],
		desc: 'compile',
		handler: compile
	})
	.command({
		command: 'dev', // <required> [optional]
		aliases: [],
		desc: 'run app in development mode',
		handler: dev
	})
	.command({
		command: 'init', // <required> [optional]
		aliases: [],
		desc: 'create application in current directory',
		handler: init
	})
	.command({
		command: 'test', // <required> [optional]
		aliases: [],
		desc: 'just a test, probably does nothing, but i wouldn\'t try it!',
		handler: test
	})
	.command({
		command: 'create', // <required> [optional]
		aliases: ['c'],
		desc: 'create a new component',
		handler: create
	})
	.demandCommand()
	.help()
	.wrap(Math.min(process.stdout.getWindowSize()[0], 80))
	.argv

