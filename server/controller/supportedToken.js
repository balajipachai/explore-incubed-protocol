const utils = require('../utils/');

async function depositToken(params) {
  const { privateKey, minimumDeposit, network } = params;
  const web3 = utils.getIn3Provider(network); // This sets the web3 object
  const contractInstance = utils.getContractInstance(process.env.WETH9_CONTRACT_NAME, network);
  // const functionABI = utils.getFunctionABI(process.env.WETH9_CONTRACT_NAME, 'deposit');
  // eslint-disable-next-line prefer-destructuring
  // const { inputs } = functionABI[0];
  const method = 'transfer(address,uint256)';
  console.log('method: ', method, privateKey);
  // console.log(Object.keys(web3.currentProvider));
  console.log('****************', web3.eth.defaultAccount);
  web3.eth.defaultAccount = params.from;
  console.log('****************', web3.eth.defaultAccount);
  // web3.currentProvider.config.key = privateKey;
  const receipt = await utils.sendContractTransaction({
    to: contractInstance.address,
    method,
    args: ['0x5564E6744E613B0AfBc8f83d13781e49d52D9b2b', minimumDeposit],
    privateKey,
  });
  // const receipt = await contractInstance.methods.deposit().send({ from: '0x27c2d54128FfF7B10d14a1f16836760CeF68C154' });
  // web3.currentProvider.config.key = process.env.IN3_SIGNING_KEY;
  return receipt;
}

module.exports = {
  depositToken,
};
