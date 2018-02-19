FROM centos

RUN yum -y update && yum clean all
RUN yum install -y gcc gcc-c++ wget yum-utils make zlib-dev openssl-devel sqlite-devel bzip2-devel git && yum clean all

RUN yum install -y golang gmp-devel && yum clean all
RUN mkdir /eth_src
RUN git clone https://github.com/ethereum/go-ethereum /eth_src
RUN cd /eth_src && make geth


RUN mkdir /eth
RUN mkdir /eth/data
RUN cp /eth_src/build/bin/geth /eth/geth
RUN chmod -R 777 /eth

WORKDIR /eth

EXPOSE 8545
CMD /bin/bash /eth/start.sh