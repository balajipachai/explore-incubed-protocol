const nodeRegistryLogic = require('./nodeRegistryLogic.js');

async function getNodeRegistryLogicPublicVariables(params) {
  const data = await nodeRegistryLogic.getPublicVariables(params);
  return data;
}

module.exports = {
  getNodeRegistryLogicPublicVariables,
};
