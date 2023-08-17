require("solidity-coverage");

module.exports = {
  //...
  solidity: {
    version: "0.8.18",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    //...
  },
  mocha: {
    //...
  },
  plugins: ["solidity-coverage"],
};
