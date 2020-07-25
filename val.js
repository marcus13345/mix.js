#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const { resolve } = require('path');
const { writeFileSync, readFileSync } = require('fs');
const config = require('./src/config');
const webpack = require('webpack');
const concurrently = require('concurrently');
const electronPath = require('electron');
const supervisor = require('supervisor');
const express = require('express');
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

function printStats(err, stats) {
  if(stats.hasErrors()) {
    for(const err of stats.compilation.errors) {
      console.log(err.toString());
    }
  } else {
    console.log(stats.toString({
      colors: true
    }));
  }
}

function compile() {
  const compiler = webpack(require('./webpack.config'))
  compiler.run(printStats);
}

function hotCompile() {
  const compiler = webpack(require('./webpack.config'));
  const closable = compiler.watch({}, printStats);
}

function electron() {
  spawn(electronPath, [
    resolve(__dirname, 'electron'),
    resolve(config.rootDir, 'dist/index.html')
  ], {
    stdio: 'inherit'
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
      entry
    ])
  }
}

function serve() {
  const app = express();
  app.use(express.static(resolve(config.rootDir, 'dist')));
  app.use((req, res) => {
    res.end(readFileSync(resolve(config.rootDir, 'dist/index.html')))
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
  writeFileSync(resolve(process.cwd(), 'app.config.js'), 'module.exports = {\n\n}');
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
  .demandCommand()
  .help()
  .wrap(Math.min(process.stdout.getWindowSize()[0], 80))
  .argv

