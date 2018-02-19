FROM centos

RUN yum -y update && yum clean all
RUN yum install -y gcc gcc-c++ wget yum-utils make zlib-dev openssl-devel sqlite-devel bzip2-devel git && yum clean all

#we need node js for correct deploy as it is
RUN curl -sL https://rpm.nodesource.com/setup_7.x | bash -
RUN yum install -y nodejs && yum clean all
RUN echo 'export NODE_PATH="'$(npm root -g)'"' >> /etc/profile.d/npm.sh

RUN npm install --global node-cmd --unsafe
RUN npm install --global cron -unsafe
RUN npm install --global moment-timezone --unsafe
RUN npm install --global fs --unsafe
RUN npm install --global sleep --unsafe
RUN npm install --global ethereumjs-tx --unsafe
#RUN npm install --global web3 --unsafe
#RUN npm install --global fs-extra --unsafe
#RUN npm install --global solc --unsafe
#RUN npm install --global truffle --unsafe
#RUN npm install --global truffle-hdwallet-provider -unsafe
#RUN npm install --global zeppelin-solidity -unsafe
#RUN npm install --global babel -unsafe
#RUN npm install --global babel-register --save-dev


RUN mkdir /pyrrha
RUN git clone https://github.com/pandoraboxchain/pyrrha-consensus /pyrrha
RUN cd /pyrrha && npm install
RUN cd /pyrrha && npm install babel-register --save-dev
RUN cd /pyrrha && npm install web3@1.0.0-beta.29 --save

COPY ./tofix/PAN.sol /pyrrha/contracts/pandora/token/PAN.sol

RUN mkdir /pyrrha/totest

WORKDIR /pyrrha/totest

CMD node /pyrrha/deploy.js