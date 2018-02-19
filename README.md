# DOCKERATOR

its repos for all repos putting in one environment runners so you need to deploy one docker-compose for all

repos built on centos as you can use it to install on clean hostings (not only dockered but directly running if needed)


## COULD BE ISSUES

error starting userland proxy: mkdir /port/tcp:0.0.0.0:30303 - solved https://github.com/docker/for-win/issues/573
turn on / off experimental setting in windows-docker will help


## ETH

- ethnode - done (need to be tuned!) from basic https://github.com/ethereum/go-ethereum/wiki/Installation-Instructions-for-Ubuntu

- ethnode_ext - done from https://github.com/Capgemini-AIE/ethereum-docker.git

### manual connection geth

geth attach http://ethnode:8545
 
### Genesis ETH wallets

#### Contract owner

pub: 0x35e364227e50Ee73e24a5ca9df8aC9496E24ECF4

priv: b0b3417c6844235ca068e7b771ead09a48c0a97728b06955c7b08cfe6ed448a8