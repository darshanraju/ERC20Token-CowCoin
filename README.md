# Boilerplate-Dapp

An out of box Dapp that connects to a local ganache blockchain.

# To Use

1. Fork or clone this repo
2. npm i
3. Compile smart contracts
   truffle compile
4. run local blockchain
   ganache-cli
5. migrate your contracts to the local blockchain
   truffle migrate
6. Import one of the private keys give given in the ganache-cli output into your metamask (This should give you 100eth to test with)
7. Start the server
   cd client
   npm start
