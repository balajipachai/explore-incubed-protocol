const Promise = require('bluebird');
const utils = require('../utils/');

/**
 * Function that gets all the public variable of NodeRegistryLogic contract
 * @param {JSON} params JSON object
 */
async function getPublicVariables(params) {
  const { network } = params;
  utils.getIn3Provider(network); // This sets the web3 object
  const contractInstance = utils.getContractInstance(
    process.env.NODEREGISTRYLOGIC_CONTRACT_NAME, network,
  );
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

async function registerNode(params) {
  const {
    url, props, weight, minimumDeposit, network, privateKey,
  } = params;
  const in3 = utils.getIn3Provider(network); // This sets the web3 object
  const nodeRegLogicConInstance = utils.getContractInstance(
    process.env.NODEREGISTRYLOGIC_CONTRACT_NAME, network,
  );
  const functionABI = utils.getFunctionABI(process.env.NODEREGISTRYLOGIC_CONTRACT_NAME, 'registerNode');
  // eslint-disable-next-line prefer-destructuring
  const { inputs } = functionABI[0];
  const method = utils.getMethod('registerNode', inputs);
  const accountAddress = utils.addressFromPrivateKey(privateKey);
  const nonce = await in3.eth.getTransactionCount(accountAddress);
  const receipt = await in3.eth.sendTransaction({
    // eslint-disable-next-line no-underscore-dangle
    to: nodeRegLogicConInstance._address,
    method,
    args: [url, props, weight, minimumDeposit],
    confirmations: 2,
    nonce,
    pk: privateKey,
  });
  // Set the Private Key again to IN3_SIGNING_KEY
  in3.config.key = process.env.IN3_SIGNING_KEY;
  return utils.getResponseFromTransactionReceipt(receipt);
}

module.exports = {
  getPublicVariables,
  registerNode,
};
