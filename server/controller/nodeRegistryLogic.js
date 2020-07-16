const Promise = require('bluebird');
const utils = require('../utils/');

/**
 * Function that gets all the public variable of NodeRegistryLogic contract
 * @param {JSON} params JSON object
 */
async function getPublicVariables(params) {
  const { network } = params;
  utils.getIn3Provider(network); // This sets the web3 object
  const contractInstance = utils.getContractInstance('NodeRegistryLogic', network);
  console.log(contractInstance);
  const publicVariables = await Promise.all([
    contractInstance.methods.blockRegistry().call(),
    contractInstance.methods.nodeRegistryData().call(),
    contractInstance.methods.timestampAdminKeyActive().call(),
    contractInstance.methods.adminKey().call(),
    contractInstance.methods.updateTimeout().call(),
    contractInstance.methods.pendingNewLogic().call(),
    contractInstance.methods.maxDepositFirstYear().call(),
    contractInstance.methods.minDeposit().call(),
    contractInstance.methods.VERSION().call(),
    contractInstance.methods.totalNodes().call(),
    contractInstance.methods.supportedToken().call(),
  ]);
  const [
    blockRegistry, nodeRegistryData, timestampAdminKeyActive, adminKey,
    updateTimeout, pendingNewLogic, maxDepositFirstYear, minDeposit, VERSION,
    totalNodes, supportedToken,
  ] = publicVariables;
  return [{
    blockRegistry,
    nodeRegistryData,
    timestampAdminKeyActive,
    adminKey,
    updateTimeout,
    pendingNewLogic,
    maxDepositFirstYear,
    minDeposit,
    VERSION,
    totalNodes,
    supportedToken,
  }];
}

module.exports = {
  getPublicVariables,
};
