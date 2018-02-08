module.exports = {
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  },
  networks: {
    ropsten: {
      network_id: 3,
      host: 'localhost',
      //host: '76.178.24.27',
      port: 8545,
      gas: 4700000,
      gasPrice: 22000000000,
      // from: '0x30a259900656F599EDEEBF1eB7E1fBf948072Ba3',
      // provider: new Web3.providers.HttpProvider('http://76.178.24.27:8545')
    },
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*", // Match any network id
      //gas: 6721975,
      gas: 4712388,
      gasPrice: 22000000000
    }
  }
};
