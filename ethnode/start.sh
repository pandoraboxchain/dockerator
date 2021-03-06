echo STARTED2

chmod -R 777 /eth
chmod -R 777 /eth/genesis.json
rm -R -f /eth/data
mkdir /eth/data

/eth/geth --datadir /eth/data --networkid 15 init /eth/genesis.json
cp -r /eth/keystore /eth/data/
/eth/geth --datadir /eth/data account list


/eth/geth --mine --minerthreads 8 --etherbase "007ccffb7916f37f7aeef05e8096ecfbe55afc2f" --rpc --rpcapi "admin,db,eth,debug,miner,net,shh,txpool,personal,web3" --rpccorsdomain '*' --rpcaddr "0.0.0.0" --rpcport 8545 --nodiscover --nat=none --networkid 15 --verbosity 5 --datadir /eth/data console
####while true; do echo '.'; sleep 1000; done 