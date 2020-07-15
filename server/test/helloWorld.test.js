/* eslint-disable node/no-unpublished-require */
/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */
const {
  BN,
  balance,
  constants,
  ether,
  expectEvent,
  send,
  expectRevert,
  time,
} = require('@openzeppelin/test-helpers');
const { assert } = require('chai');

// eslint-disable-next-line no-undef
const HelloWorld = artifacts.require('HelloWorld');

// eslint-disable-next-line no-undef
contract('HelloWorld', (accounts) => {
  const [coinbase] = accounts;
  let contractInstance;

  before(async function () {
    contractInstance = await HelloWorld.new({ from: coinbase });
  });

  context('changeMessage', function () {
    let block;
    // eslint-disable-next-line mocha/no-setup-in-describe
    const timestamp = Date.now();
    it('should change message to How are you, World?', async function () {
      block = await contractInstance.changeMessage('How are you, World?', timestamp, { from: coinbase });
      assert.equal(block.receipt.status, true, 'Transaction failed');
    });

    it('emits a LogMessageChanged event on successful changed message', async function () {
      const transactionReceipt = block.receipt;
      expectEvent(transactionReceipt, 'LogMessageChanged', {
        oldMessage: 'Hello, World !!!',
        newMessage: 'How are you, World?',
        timestamp: new BN(timestamp),
      });
    });
  });
});
