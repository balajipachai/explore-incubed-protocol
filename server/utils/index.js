/* eslint-disable security/detect-object-injection */
const in3wasm = require('in3-wasm');
const Web3 = require('web3');
const NodeRegistryLogicJSON = require('../build/contracts/NodeRegistryLogic.json');
const BlockhashRegistryJSON = require('../build/contracts/BlockhashRegistry.json');
const NodeRegistryDataJSON = require('../build/contracts/NodeRegistryData.json');

let web3;

/**
 * Function to get the IN3 Provider depending on the network
 * @param {String} network The network on which the provider is to be fetched
 */
function getIn3Provider(network) {
  const chainId = `IN3_${network}_CHAIN_ID`;
  console.log('chainId: ', chainId);
  const in3 = new in3wasm.IN3({
    proof: process.env.IN3_PROOF,
    signatureCount: parseInt(process.env.IN3_SIGNATURE_COUNT, 10),
    requestCount: parseInt(process.env.IN3_REQUEST_COUNT, 10),
    chainId: process.env[chainId],
    replaceLatestBlock: parseInt(process.env.IN3_REPLACE_LATEST_BLOCKS, 10),
    key: process.env.IN3_SIGNING_KEY,
  });
  web3 = new Web3(in3.createWeb3Provider());
}

/**
 * Function that gets the contract instance on a particular network
 * @param {String} contractName The name of the contract
 * @param {String} network The network name
 */
function getContractInstance(contractName, network) {
  const deployedOn = `NODEREGISTRY_LOGIC_DEPLOYED_ADDRESS_${network}`;
  console.log('deployedOn & contractname', deployedOn, contractName);
  switch (contractName) {
    case 'NodeRegistryLogic': return new web3.eth.Contract(NodeRegistryLogicJSON.abi, process.env[deployedOn]);
    case 'BlockhashRegistry': return new web3.eth.Contract(BlockhashRegistryJSON.abi, process.env[deployedOn]);
    case 'NodeRegistryData': return new web3.eth.Contract(NodeRegistryDataJSON.abi, process.env[deployedOn]);
    default:
      throw new Error('No case matched in getContractInstance');
  }
}

module.exports = {
  getIn3Provider,
  getContractInstance,
};