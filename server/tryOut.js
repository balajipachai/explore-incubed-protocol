const in3wasm = require('in3-wasm');
const Web3 = require('web3');
require('dotenv').config();
const NodeRegistryLogicABIJSON = require('./build/contracts/NodeRegistryLogic.json');

const in3 = new in3wasm.IN3({
  proof: 'standard',
  signatureCount: 1,
  requestCount: 1,
  chainId: 'mainnet',
  replaceLatestBlock: 10,
});

// use the In3Client as Http-Provider
const web3 = new Web3(in3.createWeb3Provider());

(async () => {
  // use the web3
  //   const block = await web3.eth.getBlock('latest');
  //   console.log('Block : ', block);

  const { abi } = NodeRegistryLogicABIJSON;
  console.log('Contract address: ', process.env.NODEREGISTRY_LOGIC_DEPLOYED_ADDRESS_MAINNET);
  const contract = new web3.eth.Contract(abi, process.env.NODEREGISTRY_LOGIC_DEPLOYED_ADDRESS_MAINNET);
  const version = await contract.methods.VERSION().call();
  console.log('Version in NodeRegistryLogic contract on Mainnet: ', version);
  return 0;
})().catch(console.error);
