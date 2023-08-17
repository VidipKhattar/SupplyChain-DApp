var SoybeanSupplyChain = artifacts.require("SoybeanSupplyChain.sol");
module.exports = function (deployer) {
  deployer.deploy(SoybeanSupplyChain);
  // Additional contracts can be deployed here
};
