module.paths.push('/usr/lib/node_modules');

var cmd = require('node-cmd');
var cron = require('cron');
var fs = require('fs');
var sleep = require('sleep');
var Web3 = require('web3');

console.log('-----------');
var time = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
console.log(time);
console.log('test.js is running');

var cron_info = new cron.CronJob({
    cronTime: '1 * * * *',
    onTick: function () {
        console.log('.');
    },
    start: true
});