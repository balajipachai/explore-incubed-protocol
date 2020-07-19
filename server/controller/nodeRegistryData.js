const utils = require('../utils/');

async function getIN3NodeInfo(params) {
  const {
    index, signer, network, signerOrNodeInfo,
  } = params;
  const in3 = utils.getIn3Provider(network); // This sets the web3 object
  const nodeRegDataConInstance = utils.getContractInstance(
    process.env.NODEREGISTRYDATA_CONTRACT_NAME, network,
  );
  const { _address } = nodeRegDataConInstance;
  let details;
  // in3.eth.callFn(_address, 'blockRegistry():address'),
  // new BigNumber(await in3.eth.callFn(_address, 'timestampAdminKeyActive():uint')),
  if (!index || index) {
    details = await in3.eth.callFn(_address, 'getIn3NodeInformation(uint256):In3Node', index);
    return details;
  }
  // signerOrNodeInfo = true implies getSignerInformation
  // signerOrNodeInfo = false implies getNodeInformationBySigner
  if (signerOrNodeInfo) {
    details = await in3.eth.callFn(_address, 'getSignerInformation(address):SignerInformation', signer);
  } else {
    details = await in3.eth.callFn(_address, 'getNodeInfromationBySigner(address):In3Node', signer);
  }
  return details;
}

module.exports = {
  getIN3NodeInfo,
};
