/* eslint-disable security/detect-object-injection */
const in3wasm = require('in3-wasm');
const ethereumjsUtil = require('ethereumjs-util');
const NodeRegistryLogicJSON = require('../build/contracts/NodeRegistryLogic');
const BlockhashRegistryJSON = require('../build/contracts/BlockhashRegistry');
const NodeRegistryDataJSON = require('../build/contracts/NodeRegistryData');
const WETH9JSON = require('../build/contracts/WETH9');

let in3;

/**
 * Function to get the IN3 Provider depending on the network
 * @param {String} network The network on which the provider is to be fetched
 */
function getIn3Provider(network) {
  const chainId = `IN3_${network}_CHAIN_ID`;
  in3 = new in3wasm.IN3({
    proof: process.env.IN3_PROOF,
    signatureCount: parseInt(process.env.IN3_SIGNATURE_COUNT, 10),
    requestCount: parseInt(process.env.IN3_REQUEST_COUNT, 10),
    chainId: process.env[chainId],
    replaceLatestBlock: parseInt(process.env.IN3_REPLACE_LATEST_BLOCKS, 10),
    key: process.env.IN3_SIGNING_KEY,
    maxAttempts: parseInt(process.env.IN3_MAX_ATTEMPTS, 10),
    timeout: parseInt(process.env.IN3_TIMEOUT, 10),
  });
  return in3;
}

/**
 * Function that gets the contract instance on a particular network
 * @param {String} contractName The name of the contract
 * @param {String} network The network name
 */
function getContractInstance(contractName, network) {
  let deployedOn = '';
  switch (contractName) {
    case 'NodeRegistryLogic':
      deployedOn = `NODEREGISTRY_LOGIC_DEPLOYED_ADDRESS_${network}`;
      return in3.eth.contractAt(NodeRegistryLogicJSON.abi, process.env[deployedOn]);
    case 'BlockhashRegistry':
      deployedOn = `BLOCKHASHREGISTRY_LOGIC_DEPLOYED_ADDRESS_${network}`;
      return in3.eth.contractAt(BlockhashRegistryJSON.abi, process.env[deployedOn]);
    case 'NodeRegistryData':
      deployedOn = `NODEREGISTRYDATA_LOGIC_DEPLOYED_ADDRESS_${network}`;
      return in3.eth.contractAt(NodeRegistryDataJSON.abi, process.env[deployedOn]);
    case 'WETH9':
      deployedOn = `WETH9_DEPLOYED_ADDRESS_${network}`;
      return in3.eth.contractAt(WETH9JSON.abi, process.env[deployedOn]);
    default:
      throw new Error('No case matched in getContractInstance');
  }
}

function getABIHelper(abi, functionName) {
  return abi.filter((functionABI) => functionABI.name === functionName);
}

function getFunctionABI(contractName, functionName) {
  switch (contractName) {
    case 'NodeRegistryLogic': return getABIHelper(NodeRegistryLogicJSON.abi, functionName);
    case 'BlockhashRegistry': return getABIHelper(BlockhashRegistryJSON.abi, functionName);
    case 'NodeRegistryData': return getABIHelper(NodeRegistryDataJSON.abi, functionName);
    case 'WETH9': return getABIHelper(WETH9JSON.abi, functionName);
    default:
      throw new Error('No case matched in getFunctionABI');
  }
}

function getMethod(methodName, inputs) {
  let method = `${methodName}(`;
  inputs.forEach((input, index) => {
    if (index !== inputs.length - 1) {
      method += `${input.type},`;
    } else {
      method += `${input.type})`;
    }
  });
  return method;
}

function getResponseFromTransactionReceipt(transactionReceipt) {
  const {
    blockHash,
    blockNumber,
    cumulativeGasUsed,
    from,
    gasUsed,
    status,
    to,
    transactionHash,
  } = transactionReceipt;
  return {
    blockHash,
    blockNumber,
    cumulativeGasUsed,
    from,
    gasUsed,
    status,
    to,
    transactionHash,
  };
}

function addressFromPrivateKey(privateKey) {
  return ethereumjsUtil.bufferToHex(
    ethereumjsUtil.privateToAddress(
      ethereumjsUtil.toBuffer(
        privateKey,
      ),
    ),
  );
}

function getChainId(network) {
  switch (network) {
    case 'MAINNET': return 0x1;
    case 'KOVAN': return 0x2a;
    case 'EVAN': return 0x4b1;
    case 'GOERLI': return 0x5;
    case 'IPFS': return 0x7d0;
    default:
      throw new Error('No case matched in getChainId');
  }
}

async function sendTransaction(network, tx) {
  const transaction = JSON.parse(tx);
  const { pk } = transaction;
  const chainId = getChainId(network);
  const provider = new in3wasm.IN3({
    proof: 'standard',
    signatureCount: 1,
    requestCount: 1,
    chainId,
    replaceLatestBlock: 10,
    maxAttempts: 10,
    key: pk,
    timeout: 1200000,
  });
  const accountAddress = addressFromPrivateKey(pk);
  const nonce = await provider.eth.getTransactionCount(accountAddress);
  transaction.sender = accountAddress;
  transaction.nonce = nonce;
  transaction.gasPrice = '0x77359400'; // 2 Gwei
  transaction.gas = '0x2dc6c0'; // 3000000
  const receipt = await provider.eth.sendTransaction(transaction);
  return getResponseFromTransactionReceipt(receipt);
}

module.exports = {
  getIn3Provider,
  getContractInstance,
  getFunctionABI,
  getMethod,
  getResponseFromTransactionReceipt,
  addressFromPrivateKey,
  sendTransaction,
};
