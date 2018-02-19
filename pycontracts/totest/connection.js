module.paths.push('/usr/lib/node_modules');

var cmd = require('node-cmd');
var cron = require('cron');
var fs = require('fs');
var sleep = require('sleep');
var Web3 = require('web3');

console.log('-----------');
var time = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
console.log(time);
console.log('connection.js is running');


var Web3 = require('web3')
var web3 = new Web3(new Web3.providers.HttpProvider("http://ethnode:8545"))
console.log(web3.eth.accounts);