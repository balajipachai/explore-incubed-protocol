/* eslint-disable func-names */
// eslint-disable-next-line no-undef
const HelloWorld = artifacts.require('HelloWorld');

module.exports = function (deployer, network, accounts) {
  const [owner] = accounts;
  deployer.deploy(HelloWorld, { from: owner });
};
