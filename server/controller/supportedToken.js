const utils = require('../utils/');
const producer = require('./queue/producer');

async function depositToken(params) {
  const { privateKey, minimumDeposit, network } = params;
  const in3 = utils.getIn3Provider(network); // This sets the web3 object
  const tokenContractinstance = utils.getContractInstance(process.env.WETH9_CONTRACT_NAME, network);
  const method = 'deposit()';
  const value = parseInt(minimumDeposit, 10);
  const accountAddress = utils.addressFromPrivateKey(privateKey);
  const nonce = await in3.eth.getTransactionCount(accountAddress);
  console.log(4);
  producer.sendMessage(
    network,
    {
      // eslint-disable-next-line no-underscore-dangle
      to: tokenContractinstance._address,
      method,
      args: [],
      confirmations: 2,
      value,
      nonce,
      pk: privateKey,
    },
  );
  // Set the Private Key again to IN3_SIGNING_KEY
  in3.config.key = process.env.IN3_SIGNING_KEY;
  return 'Transaction submitted to the blockchain';
}

async function approveToken(params) {
  const {
    privateKey, network, to, amount,
  } = params;
  let approveTo = to;
  const in3 = utils.getIn3Provider(network); // This sets the web3 object
  const tokenContractinstance = utils.getContractInstance(process.env.WETH9_CONTRACT_NAME, network);
  if (approveTo === '') {
    // It implies NodeRegistryLogic Contract has to be approved for registering a node
    const nodeRegLogicConInstance = utils.getContractInstance(
      process.env.NODEREGISTRYLOGIC_CONTRACT_NAME, network,
    );
    // eslint-disable-next-line no-underscore-dangle
    approveTo = nodeRegLogicConInstance._address;
  }
  const functionABI = utils.getFunctionABI(process.env.WETH9_CONTRACT_NAME, 'approve');
  // eslint-disable-next-line prefer-destructuring
  const { inputs } = functionABI[0];
  const method = utils.getMethod('approve', inputs);
  producer.sendMessage(
    network,
    {
      // eslint-disable-next-line no-underscore-dangle
      to: tokenContractinstance._address,
      method,
      args: [approveTo, amount],
      confirmations: 2,
      pk: privateKey,
    },
  );
  // Set the Private Key again to IN3_SIGNING_KEY
  in3.config.key = process.env.IN3_SIGNING_KEY;
  return 'Transaction submitted to the blockchain';
}

module.exports = {
  depositToken,
  approveToken,
};
