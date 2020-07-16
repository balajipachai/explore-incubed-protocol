/* eslint-disable no-undef */
/* eslint-disable func-names */

const BlockhashRegistry = artifacts.require('BlockhashRegistry');
const NodeRegistryData = artifacts.require('NodeRegistryData');
const NodeRegistryLogic = artifacts.require('NodeRegistryLogic');

module.exports = function (deployer, network, accounts) {
  const [owner] = accounts;
  const minDeposit = 1000;
  deployer.deploy(BlockhashRegistry, { from: owner })
    .then(() => deployer.deploy(NodeRegistryData, { from: owner }))
    .then(() => deployer.deploy(
      NodeRegistryLogic, BlockhashRegistry.address, NodeRegistryData.address, minDeposit,
      { from: owner },
    ));
};
