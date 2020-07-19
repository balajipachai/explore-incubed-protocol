const nodeRegistryLogic = require('./nodeRegistryLogic');
const supportedToken = require('./supportedToken');
const nodeRegistryData = require('./nodeRegistryData');

async function getNodeRegistryLogicPublicVariables(params) {
  const data = await nodeRegistryLogic.getPublicVariables(params);
  return data;
}

async function supportedTokenApproval(params) {
  const receipt = await supportedToken.approveToken(params);
  return receipt;
}

async function nodeRegistryDataGetIN3NodeInfo(params) {
  const data = await nodeRegistryData.getIN3NodeInfo(params);
  return data;
}

async function nodeRegistryLogicActivateNewLogicContract(params) {
  const receipt = await nodeRegistryLogic.activateNewLogicContract(params);
  return receipt;
}

async function nodeRegistryLogicAdminUpdateLogic(params) {
  const receipt = await nodeRegistryLogic.adminUpdateLogic(params);
  return receipt;
}

async function nodeRegistryLogicAdminRemoveNodeFromRegistry(params) {
  const receipt = await nodeRegistryLogic.adminRemoveNodeFromRegistry(params);
  return receipt;
}

async function supportedTokenDeposit(params) {
  const receipt = await supportedToken.depositToken(params);
  return receipt;
}

async function nodeRegistryLogicRegisterNode(params) {
  const {
    privateKey, network, to, minimumDeposit: amount,
  } = params;
  // THESE BELOW CALLS NEED IMPROVEMENTS, HERE WE CAN USE QUEUE IMPLEMENTATION
  // FOR MAKING CALLS TO THE BLOCKCHAIN NETWORK
  await supportedTokenDeposit(params);
  await supportedTokenApproval({
    privateKey,
    network,
    to,
    amount,
  });
  const receipt = await nodeRegistryLogic.registerNode(params);
  return receipt;
}

async function nodeRegistryLogicReturnDeposits(params) {
  const receipt = await nodeRegistryLogic.returnDeposits(params);
  return receipt;
}

async function nodeRegistryLogicTransferIN3NodeOwnership(params) {
  const receipt = await nodeRegistryLogic.transferIN3NodeOwnership(params);
  return receipt;
}

async function nodeRegistryLogicUnregisterIN3Node(params) {
  const receipt = await nodeRegistryLogic.unregisterIN3Node(params);
  return receipt;
}

async function nodeRegistryLogicUpdateIN3Node(params) {
  const {
    additionalDeposit, network, ownerPrivateKey,
  } = params;
  if (additionalDeposit > 0) {
    // THESE BELOW CALLS NEED IMPROVEMENTS, HERE WE CAN USE QUEUE IMPLEMENTATION
    // FOR MAKING CALLS TO THE BLOCKCHAIN NETWORK
    await supportedTokenDeposit({
      privateKey: ownerPrivateKey,
      minimumDeposit: additionalDeposit,
      network,
    });
    await supportedTokenApproval({
      privateKey: ownerPrivateKey,
      network,
      to: '',
      amount: additionalDeposit,
    });
    const receipt = await nodeRegistryLogic.updateIN3Node(params);
    return receipt;
  }
  const receipt = await nodeRegistryLogic.updateIN3Node(params);
  return receipt;
}



module.exports = {
  getNodeRegistryLogicPublicVariables,
  nodeRegistryDataGetIN3NodeInfo,
  nodeRegistryLogicActivateNewLogicContract,
  nodeRegistryLogicAdminUpdateLogic,
  nodeRegistryLogicAdminRemoveNodeFromRegistry,
  nodeRegistryLogicRegisterNode,
  nodeRegistryLogicReturnDeposits,
  supportedTokenDeposit,
  nodeRegistryLogicTransferIN3NodeOwnership,
  nodeRegistryLogicUnregisterIN3Node,
  nodeRegistryLogicUpdateIN3Node,
};
