const nodeRegistryLogic = require('./nodeRegistryLogic');
const supportedToken = require('./supportedToken');

async function getNodeRegistryLogicPublicVariables(params) {
  const data = await nodeRegistryLogic.getPublicVariables(params);
  return data;
}

async function supportedTokenDeposit(params) {
  const receipt = await supportedToken.depositToken(params);
  return receipt;
}

async function supportedTokenApproval(params) {
  const receipt = await supportedToken.approveToken(params);
  return receipt;
}

async function nodeRegistryLogicRegisterNode(params) {
  const {
    privateKey, network, to, minimumDeposit: amount,
  } = params;
  await supportedTokenDeposit(params);
  await supportedTokenApproval({
    privateKey,
    network,
    to,
    amount,
  });
  const data = await nodeRegistryLogic.registerNode(params);
  return data;
}

module.exports = {
  getNodeRegistryLogicPublicVariables,
  nodeRegistryLogicRegisterNode,
  supportedTokenDeposit,
};
