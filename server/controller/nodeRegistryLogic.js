const Promise = require('bluebird');
const BigNumber = require('bignumber.js');
const utils = require('../utils/');
const producer = require('./queue/producer');

/**
 * Function to activate the new NodeRegistryLogic contract
 * @param {JSON} params JSON object with all the key-value pairs
 */
async function activateNewLogicContract(params) {
  const { privateKey, network } = params;
  const in3 = utils.getIn3Provider(network); // This sets the web3 object
  const nodeRegLogicConInstance = utils.getContractInstance(
    process.env.NODEREGISTRYLOGIC_CONTRACT_NAME, network,
  );
  producer.sendMessage(
    network,
    {
      // eslint-disable-next-line no-underscore-dangle
      to: nodeRegLogicConInstance._address,
      method: 'activateNewLogic()',
      args: [],
      confirmations: 2,
      pk: privateKey,
      network,
    },
  );
  return 'Transaction submitted to the blockchain';
}

/**
 * Function to update the NodeRegistryLogic contract
 * @param {JSON} params JSON object with all the key-value pairs
 */
async function adminUpdateLogic(params) {
  const { newLogic, network } = params;
  const in3 = utils.getIn3Provider(network); // This sets the web3 object
  const nodeRegLogicConInstance = utils.getContractInstance(
    process.env.NODEREGISTRYLOGIC_CONTRACT_NAME, network,
  );
  const functionABI = utils.getFunctionABI(process.env.NODEREGISTRYLOGIC_CONTRACT_NAME, 'adminUpdateLogic');
  // eslint-disable-next-line prefer-destructuring
  const { inputs } = functionABI[0];
  const method = utils.getMethod('adminUpdateLogic', inputs);
  producer.sendMessage(
    network,
    {
      // eslint-disable-next-line no-underscore-dangle
      to: nodeRegLogicConInstance._address,
      method,
      args: [newLogic],
      confirmations: 2,
      pk: process.env.IN3_SIGNING_KEY,
    },
  );
  return 'Transaction submitted to the blockchain';
}

/**
 * Function that removes a node from the registry
 * @param {JSON} params JSON object with all the key-value pairs
 */
async function adminRemoveNodeFromRegistry(params) {
  const { signer, network } = params;
  const in3 = utils.getIn3Provider(network); // This sets the web3 object
  const nodeRegLogicConInstance = utils.getContractInstance(
    process.env.NODEREGISTRYLOGIC_CONTRACT_NAME, network,
  );
  const functionABI = utils.getFunctionABI(process.env.NODEREGISTRYLOGIC_CONTRACT_NAME, 'adminRemoveNodeFromRegistry');
  // eslint-disable-next-line prefer-destructuring
  const { inputs } = functionABI[0];
  const method = utils.getMethod('adminRemoveNodeFromRegistry', inputs);
  producer.sendMessage(
    network,
    {
      // eslint-disable-next-line no-underscore-dangle
      to: nodeRegLogicConInstance._address,
      method,
      args: [signer],
      confirmations: 2,
      pk: process.env.IN3_SIGNING_KEY,
    },
  );
  return 'Transaction submitted to the blockchain';
}

/**
 * Function that gets all the public variable of NodeRegistryLogic contract
 * @param {JSON} params JSON object
 */
async function getPublicVariables(params) {
  const { network } = params;
  const in3 = utils.getIn3Provider(network); // This sets the web3 object
  const contractInstance = utils.getContractInstance(
    process.env.NODEREGISTRYLOGIC_CONTRACT_NAME, network,
  );
  const { _address } = contractInstance;
  const publicVariables = await Promise.all([
    in3.eth.callFn(_address, 'blockRegistry():address'),
    in3.eth.callFn(_address, 'nodeRegistryData():address'),
    new BigNumber(await in3.eth.callFn(_address, 'timestampAdminKeyActive():uint')),
    in3.eth.callFn(_address, 'adminKey():address'),
    new BigNumber(await in3.eth.callFn(_address, 'updateTimeout():uint')),
    in3.eth.callFn(_address, 'pendingNewLogic():address'),
    new BigNumber(await in3.eth.callFn(_address, 'maxDepositFirstYear():uint')),
    new BigNumber(await in3.eth.callFn(_address, 'minDeposit():uint')),
    new BigNumber(await in3.eth.callFn(_address, 'VERSION():uint')),
    new BigNumber(await in3.eth.callFn(_address, 'totalNodes():uint')),
    in3.eth.callFn(_address, 'supportedToken():address'),
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

/**
 * Function to regiter a node
 * @param {JSON} params JSON object with all the key-value pairs
 */
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
  producer.sendMessage(
    network,
    {
      // eslint-disable-next-line no-underscore-dangle
      to: nodeRegLogicConInstance._address,
      method,
      args: [url, props, weight, minimumDeposit],
      confirmations: 2,
      pk: privateKey,
    },
  );
  // Set the Private Key again to IN3_SIGNING_KEY
  in3.config.key = process.env.IN3_SIGNING_KEY;
  return 'Transaction submitted to the blockchain';
}

/**
 * Function to return a signer's deposits
 * @param {JSON} params JSON object with all the key-value pairs
 */
async function returnDeposits(params) {
  const {
    signer, network, ownerPrivateKey,
  } = params;
  const in3 = utils.getIn3Provider(network); // This sets the web3 object
  const nodeRegLogicConInstance = utils.getContractInstance(
    process.env.NODEREGISTRYLOGIC_CONTRACT_NAME, network,
  );
  const functionABI = utils.getFunctionABI(process.env.NODEREGISTRYLOGIC_CONTRACT_NAME, 'returnDeposit');
  // eslint-disable-next-line prefer-destructuring
  const { inputs } = functionABI[0];
  const method = utils.getMethod('returnDeposit', inputs);
  producer.sendMessage(
    network,
    {
      // eslint-disable-next-line no-underscore-dangle
      to: nodeRegLogicConInstance._address,
      method,
      args: [signer],
      confirmations: 2,
      pk: ownerPrivateKey,
    },
  );
  // Set the Private Key again to IN3_SIGNING_KEY
  in3.config.key = process.env.IN3_SIGNING_KEY;
  return 'Transaction submitted to the blockchain';
}

/**
 * Function that transfers an IN3 node ownership
 * @param {JSON} params JSON object with all the key-value pairs
 */
async function transferIN3NodeOwnership(params) {
  const {
    signer, newOwner, ownerPrivateKey, network,
  } = params;
  const in3 = utils.getIn3Provider(network); // This sets the web3 object
  const nodeRegLogicConInstance = utils.getContractInstance(
    process.env.NODEREGISTRYLOGIC_CONTRACT_NAME, network,
  );
  const functionABI = utils.getFunctionABI(process.env.NODEREGISTRYLOGIC_CONTRACT_NAME, 'transferOwnership');
  // eslint-disable-next-line prefer-destructuring
  const { inputs } = functionABI[0];
  const method = utils.getMethod('transferOwnership', inputs);
  producer.sendMessage(
    network,
    {
      // eslint-disable-next-line no-underscore-dangle
      to: nodeRegLogicConInstance._address,
      method,
      args: [signer, newOwner],
      confirmations: 2,
      pk: ownerPrivateKey,
    },
  );
  // Set the Private Key again to IN3_SIGNING_KEY
  in3.config.key = process.env.IN3_SIGNING_KEY;
  return 'Transaction submitted to the blockchain';
}

/**
 * Function that unregisters an IN3 node
 * @param {JSON} params JSON object with all the key-value pairs
 */
async function unregisterIN3Node(params) {
  const {
    signer, network, ownerPrivateKey,
  } = params;
  const in3 = utils.getIn3Provider(network); // This sets the web3 object
  const nodeRegLogicConInstance = utils.getContractInstance(
    process.env.NODEREGISTRYLOGIC_CONTRACT_NAME, network,
  );
  const functionABI = utils.getFunctionABI(process.env.NODEREGISTRYLOGIC_CONTRACT_NAME, 'unregisteringNode');
  // eslint-disable-next-line prefer-destructuring
  const { inputs } = functionABI[0];
  const method = utils.getMethod('unregisteringNode', inputs);
  producer.sendMessage(
    network,
    {
      // eslint-disable-next-line no-underscore-dangle
      to: nodeRegLogicConInstance._address,
      method,
      args: [signer],
      confirmations: 2,
      pk: ownerPrivateKey,
    },
  );
  // Set the Private Key again to IN3_SIGNING_KEY
  in3.config.key = process.env.IN3_SIGNING_KEY;
  return 'Transaction submitted to the blockchain';
}

/**
 * Function that updates an IN3 node
 * @param {JSON} params JSON object with all the key-value pairs
 */
async function updateIN3Node(params) {
  const {
    signer, url, props, weight, additionalDeposit, network, ownerPrivateKey,
  } = params;
  const in3 = utils.getIn3Provider(network); // This sets the web3 object
  const nodeRegLogicConInstance = utils.getContractInstance(
    process.env.NODEREGISTRYLOGIC_CONTRACT_NAME, network,
  );
  const functionABI = utils.getFunctionABI(process.env.NODEREGISTRYLOGIC_CONTRACT_NAME, 'updateNode');
  // eslint-disable-next-line prefer-destructuring
  const { inputs } = functionABI[0];
  const method = utils.getMethod('updateNode', inputs);
  producer.sendMessage(
    network,
    {
      // eslint-disable-next-line no-underscore-dangle
      to: nodeRegLogicConInstance._address,
      method,
      args: [signer, url, props, weight, additionalDeposit],
      confirmations: 2,
      pk: ownerPrivateKey,
    },
  );
  // Set the Private Key again to IN3_SIGNING_KEY
  in3.config.key = process.env.IN3_SIGNING_KEY;
  return 'Transaction submitted to the blockchain';
}

module.exports = {
  activateNewLogicContract,
  adminUpdateLogic,
  adminRemoveNodeFromRegistry,
  getPublicVariables,
  registerNode,
  returnDeposits,
  transferIN3NodeOwnership,
  unregisterIN3Node,
  updateIN3Node,
};
