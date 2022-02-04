const NaiveRepositoryIndex = artifacts.require("NaiveRepositoryIndex");

require('@openzeppelin/test-helpers/configure')({
  provider: web3.currentProvider,
  singletons: {
    abstraction: 'truffle',
  },
});

const {singletons} = require("@openzeppelin/test-helpers")

module.exports = async function (deployer, network, accounts) {
  // console.log("Network ", network);
  console.log("Default account ", accounts[0]);

  if (network === 'development'
    || network === 'develop'
    || network === 'test')  {
    // In a test environment an ERC777 token requires deploying an ERC1820 registry
    await singletons.ERC1820Registry(accounts[0]);
  }


  const repoIndex = await deployer.deploy(NaiveRepositoryIndex);

};
