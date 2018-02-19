module.paths.push('/usr/lib/node_modules');

var cmd = require('node-cmd');
var cron = require('cron');
var fs = require('fs');
var sleep = require('sleep');
var Web3 = require('web3');

var owner_address = '0x35e364227e50Ee73e24a5ca9df8aC9496E24ECF4';
var owner_private = '0xb0b3417c6844235ca068e7b771ead09a48c0a97728b06955c7b08cfe6ed448a8';

//https://infura.io/setup?key=cLGMAL2D7Evlhq4jf74C
//curl -X POST -H "Content-Type: application/json" --data '{"jsonrpc": "2.0", "id": 1, "method": "eth_blockNumber", "params": []}' "https://ropsten.infura.io/cLGMAL2D7Evlhq4jf74C"
//https://kovan.etherscan.io/address/0x35e364227e50Ee73e24a5ca9df8aC9496E24ECF4

var node_url = process.env.ETH_NODE;
var web3 = false;

console.log('-----------');
var time = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
console.log(time);
console.log('deploy.js is running');

//PREWEB3 START
var commands = [];
try {
    fs.accessSync('/pyrrha/node_modules/', fs.F_OK);
} catch (e) {
    commands.push('cd /pyrrha; npm install');
    commands.push('cd /pyrrha; npm install babel-register --save-dev');
    commands.push('cd /pyrrha; npm install web3@1.0.0-beta.29 --save');
}
try {
    fs.accessSync('/pyrrha/migrations/', fs.F_OK);
} catch (e) {
    commands.push('cd /pyrrha; /pyrrha/node_modules/.bin/truffle init');
}
try {
    fs.accessSync('/pyrrha/migrations/', fs.F_OK);
} catch (e) {
    commands.push('cd /pyrrha; /pyrrha/node_modules/.bin/truffle init');
}
commands.push('cd /pyrrha; /pyrrha/node_modules/.bin/truffle compile');


doStep(0);

function doStep(index) {
    if (!commands[index] || commands[index] == 'undefined') {
        readContracts(0);
    } else {
        console.log('running', commands[index]);
        cmd.get(commands[index],
            function (err, data, stderr) {
                console.log('result', commands[index]);
                console.log(data);
                console.log(stderr);
                doStep(index + 1);
            }
        );
    }
}

//PREWEB3 END

//READCONTRACTS START
var contracts = [];
contracts.push('/pyrrha/build/contracts/CognitiveJobFactory.json');
contracts.push('/pyrrha/build/contracts/WorkerNodeFactory.json');
contracts.push('/pyrrha/build/contracts/Pandora.json');

var contractsData = [];

function readContracts(index) {
    if (!contracts[index] || contracts[index] == 'undefined') {
        stepInitUsual();
    } else {
        fs.readFile(contracts[index], 'utf8', function (err, content) {
            if (err) {
                console.log('file is not fine', err);
                process.exit(1);
            }

            contractsData[index] = JSON.parse(content);
            if (!contractsData[index].abi) {
                console.log('contract abi is not fine', contracts[index]);
                process.exit(1);
            }
            if (!contractsData[index].bytecode) {
                console.log('contract bytecode is not fine', contracts[index]);
                process.exit(1);
            }

            readContracts(index + 1);
        });
    }
}

//READCONTRACTS START

//USUAL START
var usualTransactionWaiting = true;
var usualTransactionTX = false;

var cron_info = new cron.CronJob({
    cronTime: '* * * * *',
    onTick: function () {
        if (usualTransactionTX && usualTransactionWaiting) {
            console.log('checking usualTransactionTX', usualTransactionTX);
            web3.eth.getTransaction(usualTransactionTX).then(function (tx_data) {
                if (tx_data) {
                    tx_data.input = '';
                    if (tx_data.blockNumber) {
                        usualTransactionWaiting = false;
                        console.log('checked usualTransactionTX mined!', tx_data);
                        initContracts(0);
                    }
                }
            });
        }
    },
    start: true
});

var usualGasCron = false;

function stepInitUsual() {
    console.log('web3 check'); //here to have more time while building nodes are turning up

    var tries = 0;
    var success = false;
    do {
        try {
            web3 = new Web3(node_url);
            web3.eth.accounts.wallet.add(owner_private);
            console.log('web3 ready');
            success = true;
            break;
        } catch (err) {
            console.log(err);
            sleep.msleep(100);
            tries++;
        }
    } while (!success || tries < 100);

    if (!success) {
        console.log('node is dead while init');
        process.exit(1);
    }

    //step 2 just check usual transaction and JSON RPC response
    tries = 0;
    usualGasCron = true;
    var cron_info_tries = new cron.CronJob({
        cronTime: '* * * * *',
        onTick: function () {
            if (usualGasCron) {
                console.log('usual gas check try', tries);
                web3.eth.estimateGas({
                    "to": "0xE9078292c21513e0d65434CA270d120900EFDb70",
                    "value": 100000,
                }, function (err, gas) {
                    if (err) {
                        if (err.toString().indexOf('Invalid JSON RPC response: ""') > 0) {
                            console.log('waiting for node', node_url);
                            sleep.msleep(100);
                            tries++;
                        } else {
                            console.log('usual gas is not fine', err);
                            process.exit(1);
                        }
                    } else {
                        console.log('usual estimate gas', gas);
                        usualGasCron = false;
                        stepSendUsual(gas);
                    }
                });
            }
        },
        start: true
    });
}

function stepSendUsual(gas) {
    var success = false;
    var tries = 0;
    do {
        try {
            console.log('usual transaction check');
            web3.eth.sendTransaction({
                "gasPrice": gas,
                "gasLimit": gas,
                "to": "0xE9078292c21513e0d65434CA270d120900EFDb70",
                "from": owner_address,
                "value": 1000
            }).on('error', function (err) {
                if (err.toString().indexOf('was not mined within 50 blocks') > 0 || err.toString().indexOf('to check for transaction') > 0) {
                    usualTransactionWaiting = true;
                } else {
                    console.log('usual transaction is not ok', err);
                    process.exit(1);
                }
            }).on('transactionHash', function (transactionHash) {
                console.log('usual transaction transactionHash', transactionHash);
                usualTransactionTX = transactionHash;
            }).on('receipt', function (receipt) {
                console.log('usual transaction receipt', receipt);
            }).catch(function (err) {
                console.log('usual transaction error', err);
                console.log('setted status of usualTransactionWaiting',  usualTransactionWaiting);
            });
            success = true;
            break;
        } catch (err) {
            sleep.msleep(tries > 2 ? 1000000 : 100000);
            tries++;
        }
    } while (!success && tries < 10);

    if (!success) {
        console.log('node is dead while usual transaction check');
        process.exit(1);
    }
}

//USUAL END

//CONTRACTS START

var deployWaiting = true;
var deployTX = false;
var deployIndex = 0;

var cron_info2 = new cron.CronJob({
    cronTime: '* * * * *',
    onTick: function () {
        if (deployTX && deployWaiting) {
            console.log('contract ' + deployIndex + ' checking deployTX', deployTX);
            web3.eth.getTransaction(deployTX).then(function (tx_data) {
                if (tx_data) {
                    tx_data.input = '';
                    if (tx_data.blockNumber) {
                        deployTX = false;
                        console.log('contract ' + deployIndex + ' checked deployTX mined!', tx_data);
                        initContracts(deployIndex + 1);
                    }
                }
            });
        }
    },
    start: true
});

function initContracts(index) {
    var success = false;
    var tries = 0;
    deployIndex = index;
    do {
        try {
            console.log('contract ' + index + ' deploy gas check');
            web3.eth.estimateGas({
                "value": 0,
                "data": contractsData[index].bytecode,
            }, function (err, gas) {
                if (err) {
                    console.log('contract ' + index + ' deploy gas is not fine', err);
                    console.log(contractData[index].bytecode);
                    process.exit(1);
                }
                console.log('contract ' + index + ' deploy estimate gas', gas);
                sendContracts(index, gas);
            });
            success = true;
            break;
        } catch (err) {
            sleep.msleep(tries > 2 ? 1000000 : 100000);
            tries++;
        }
    } while (!success && tries < 10);

    if (!success) {
        console.log('node is dead while contract ' + index + ' deploy');
        process.exit(1);
    }
}

function sendContracts(index, gas) {
    var success = false;
    var tries = 0;
    do {
        try {
            console.log('contract ' + index + ' deploy transaction check');
            web3.eth.sendTransaction({
                "gasPrice": gas,
                "gasLimit": gas,
                "from": owner_address,
                "value": 0,
                "data": contractsData[index].bytecode,
            }).on('error', function (err) {
                if (err.toString().indexOf('was not mined within 50 blocks') > 0) {
                    deployWaiting = true;
                } else {
                    console.log('contract ' + index + ' deploy transaction is not fine', err);
                    process.exit(1);
                }
            }).on('transactionHash', function (transactionHash) {
                console.log('contract ' + index + ' deploy transaction transactionHash', transactionHash);
                deployTX = transactionHash;
            }).on('receipt', function (receipt) {
                console.log('contract ' + index + ' deploy transaction receipt', receipt);
            }).catch(function (err) {
                console.error('contract ' + index + ' deploy transaction error', err);
            });
            success = true;
            break;
        } catch (err) {
            sleep.msleep(tries > 2 ? 1000000 : 100000);
            tries++;
        }
    } while (!success && tries < 10);

    if (!success) {
        console.log('node is dead while contract ' + index + ' deploy transaction check');
        process.exit(1);
    }
}

//CONTRACTS END