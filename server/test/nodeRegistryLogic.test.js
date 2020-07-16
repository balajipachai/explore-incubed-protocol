/* eslint-disable no-undef */
/* eslint-disable node/no-unpublished-require */
/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */

const {
  balance,
  constants,
  ether,
  expectEvent,
  send,
  expectRevert,
  time,
} = require('@openzeppelin/test-helpers');
const { assert } = require('chai');
const BigNumber = require('bignumber.js');

const BlockhashRegistry = artifacts.require('BlockhashRegistry');
const NodeRegistryData = artifacts.require('NodeRegistryData');
const NodeRegistryLogic = artifacts.require('NodeRegistryLogic');
const WETH9 = artifacts.require('WETH9');

contract('NodeRegistryLogic', function (accounts) {
  const [coinbase, account1, signer1, signer2] = accounts;
  const minDeposit = 1000;

  let nodeRegistryLogicContractInstance;
  let nodeRegistryDataContractInstance;
  let blockhashRegistryContractInstance;
  let supportedTokenContractInstance;
  let block;

  const FIRST_NODE_URL = 'https://mybootnode-A.com';
  const FIRST_NODE_PROPS = 65535;
  const FIRST_NODE_WEIGHT = 100;
  const FIRST_NODE_DEPOSIT = minDeposit;
  const FIRST_NODE_SIGNER = signer1;

  const SECOND_NODE_URL = 'https://mybootnode-B.com';
  const SECOND_NODE_PROPS = 65534;
  const SECOND_NODE_WEIGHT = 51;
  const SECOND_NODE_DEPOSIT = minDeposit;
  const SECOND_NODE_SIGNER = signer2;

  before(async function () {
    blockhashRegistryContractInstance = await BlockhashRegistry.new({ from: coinbase });
    nodeRegistryDataContractInstance = await NodeRegistryData.new({ from: coinbase });
    nodeRegistryLogicContractInstance = await NodeRegistryLogic.new(
      blockhashRegistryContractInstance.address,
      nodeRegistryDataContractInstance.address,
      minDeposit,
      { from: coinbase },
    );
    supportedTokenContractInstance = await WETH9.new({ from: coinbase });
  });

  describe('Initially', function () {
    it('should revert when trying to deploy NodeRegistryLogic having blockRegistry = address(0)', async function () {
      await expectRevert(
        NodeRegistryLogic.new(
          constants.ZERO_ADDRESS,
          nodeRegistryDataContractInstance.address,
          minDeposit,
          { from: coinbase },
        ),
        'no blockRegistry address provided',
      );
    });
    it('should revert when trying to deploy NodeRegistryLogic having nodeRegistryData = address(0)', async function () {
      await expectRevert(
        NodeRegistryLogic.new(
          blockhashRegistryContractInstance.address,
          constants.ZERO_ADDRESS,
          minDeposit,
          { from: coinbase },
        ),
        'no nodeRegistry address provided',
      );
    });
    it('should revert when adminSetLogic is called by no logic contract', async function () {
      await expectRevert(
        nodeRegistryDataContractInstance.adminSetLogic(
          nodeRegistryLogicContractInstance.address,
          { from: account1 },
        ),
        'not the owner',
      );
    });
    it('should revert when trying to set ZERO address as the newLogic', async function () {
      await expectRevert(
        nodeRegistryDataContractInstance.adminSetLogic(
          constants.ZERO_ADDRESS,
          { from: coinbase },
        ),
        'no address provided',
      );
    });
    it('should revert when supportedToken is set by nonLogic contract', async function () {
      await expectRevert(
        nodeRegistryDataContractInstance.adminSetSupportedToken(
          supportedTokenContractInstance.address, { from: account1 },
        ),
        'not the owner',
      );
    });
    it('should revert when supportedToken is address(0)', async function () {
      await expectRevert(
        nodeRegistryDataContractInstance.adminSetSupportedToken(
          constants.ZERO_ADDRESS, { from: coinbase },
        ),
        '0x0 is invalid',
      );
    });
    it('should set the supportedToken when called by owner', async function () {
      block = await nodeRegistryDataContractInstance.adminSetSupportedToken(
        supportedTokenContractInstance.address, { from: coinbase },
      );
      assert.equal(block.receipt.status, true, 'Transaction failed');
    });
    it('should set successfully the newLogic when it is called by owner and address is non-zero', async function () {
      // AT THIS POINT THE contractOwner in NodeRegistryData is coinbase, however,
      // it should be NodeRegistryLogic, let us set that
      block = await nodeRegistryDataContractInstance.adminSetLogic(
        nodeRegistryLogicContractInstance.address,
        { from: coinbase },
      );
      assert.equal(block.receipt.status, true, 'Transaction failed');
    });
    it('should check newLogic is set as expected', async function () {
      const newLogic = await nodeRegistryDataContractInstance.ownerContract.call();
      assert.equal(newLogic, nodeRegistryLogicContractInstance.address, 'New logic is not set');
    });
  });

  describe('Check for successful constructor invocation', function () {
    context('NodeRegistryLogic Contract', function () {
      it('should check blockRegistry is set as expected', async function () {
        const blockRegistry = await nodeRegistryLogicContractInstance.blockRegistry.call();
        assert.equal(blockRegistry, blockhashRegistryContractInstance.address, 'BlockRegistry is not set');
      });
      it('should check nodeRegistryData is set as expected', async function () {
        const nodeRegistry = await nodeRegistryLogicContractInstance.nodeRegistryData.call();
        assert.equal(nodeRegistry, nodeRegistryDataContractInstance.address, 'NodeRegistryData is not set');
      });
      it('should check adminKey is set as expected', async function () {
        const adminKey = await nodeRegistryLogicContractInstance.adminKey.call();
        assert.equal(adminKey, coinbase, 'AdminKey is not set');
      });
      it('should check minDeposit is set as expected', async function () {
        const minimumDeposit = new BigNumber(await nodeRegistryLogicContractInstance.minDeposit
          .call());
        assert.equal(minimumDeposit.toNumber(), 1000, 'Minimum deposit is not set');
      });
      it('should check maxDepositFirstYear is set as expected', async function () {
        const maxDepositFirstYear = new BigNumber(
          await nodeRegistryLogicContractInstance.maxDepositFirstYear
            .call(),
        );
        assert.equal(
          maxDepositFirstYear.toNumber(), 2000 * 1000, 'MaxDepositFirstYear is not set',
        );
      });
    });

    context('NodeRegistryData Contract', function () {
      it('should check timeout is set to 40 days', async function () {
        const timeout = await nodeRegistryDataContractInstance.timeout.call();
        assert.equal(timeout.toNumber(), 40 * 86400, 'Timeout do not match'); // Since there are 86400 Seconds In a Day
      });
    });

    context('BlockhashRegistry Contract', function () {
      it('Nothing to check', async function () {
        assert.ok('Nothing to test for constructor invocation');
      });
    });
  });

  describe('registerNode', function () {
    context('reverts', function () {
      it('when deposit less than minimum deposit', async function () {
        // THIS IS minDeposit - 2 s.t. we cover the else path of require in
        // _checkNodePropertiesInternal of deposit >= minDeposit
        await expectRevert(
          nodeRegistryLogicContractInstance.registerNode(
            FIRST_NODE_URL,
            FIRST_NODE_PROPS,
            FIRST_NODE_WEIGHT,
            998,
            { from: FIRST_NODE_SIGNER },
          ),
          'not enough deposit',
        );
      });
      it('when deposit greater than maximum first year deposit', async function () {
        // After this change the deposit to 0x1158e460913d01000 s.t. we cover
        // the else path of require in _checkNodePropertiesInternal of deposit < maxDepositFirstYear
        await expectRevert(
          nodeRegistryLogicContractInstance.registerNode(
            FIRST_NODE_URL,
            FIRST_NODE_PROPS,
            FIRST_NODE_WEIGHT,
            2000001,
            { from: FIRST_NODE_SIGNER },
          ),
          'Limit of 50 ETH reached',
        );
      });
      it('when signer has not approved NodeRegistryLogic to transfer tokens', async function () {
        await expectRevert(
          nodeRegistryLogicContractInstance.registerNode(
            FIRST_NODE_URL,
            FIRST_NODE_PROPS,
            FIRST_NODE_WEIGHT,
            FIRST_NODE_DEPOSIT,
            { from: FIRST_NODE_SIGNER },
          ),
          'Insufficient balance in transfeFrom',
        );
      });
    });

    context('success', function () {
      context('FOR FIRST NODE', function () {
        it('Deposit minimum deposit into WETH9 contract from signer1', async function () {
          block = await supportedTokenContractInstance.deposit({
            from: FIRST_NODE_SIGNER,
            value: minDeposit,
          });
          assert.equal(block.receipt.status, true, 'Transaction failed');
        });
        it('should check for emitting of Deposit event', async function () {
          expectEvent(
            block.receipt,
            'Deposit', {
              dst: FIRST_NODE_SIGNER,
              wad: '1000',
            },
          );
        });
        it('signer1 approves NodeRegistryLogic contract to spend minDeposit tokens', async function () {
          block = await supportedTokenContractInstance.approve(
            nodeRegistryLogicContractInstance.address, minDeposit,
            { from: FIRST_NODE_SIGNER },
          );
          assert.equal(block.receipt.status, true, 'Transaction failed');
        });
        it('should check for emitting of Approve event', async function () {
          expectEvent(
            block.receipt,
            'Approval', {
              src: FIRST_NODE_SIGNER,
              guy: nodeRegistryLogicContractInstance.address,
              wad: '1000',
            },
          );
        });
        it('should register a node succesfully', async function () {
          block = await nodeRegistryLogicContractInstance.registerNode(
            FIRST_NODE_URL,
            FIRST_NODE_PROPS,
            FIRST_NODE_WEIGHT,
            FIRST_NODE_DEPOSIT,
            { from: FIRST_NODE_SIGNER },
          );
          assert.equal(block.receipt.status, true, 'Transaction failed');
        });
        it('should check for emitting of LogNodeRegistered event', async function () {
          expectEvent(
            block.receipt,
            'LogNodeRegistered', {
              url: FIRST_NODE_URL,
              props: '65535',
              signer: FIRST_NODE_SIGNER,
              deposit: '1000',
            },
          );
        });
      });

      context('FOR SECOND NODE', function () {
        it('Deposit minimum deposit into WETH9 contract from signer2', async function () {
          block = await supportedTokenContractInstance.deposit({
            from: SECOND_NODE_SIGNER,
            value: minDeposit,
          });
          assert.equal(block.receipt.status, true, 'Transaction failed');
        });
        it('should check for emitting of Deposit event', async function () {
          expectEvent(
            block.receipt,
            'Deposit', {
              dst: SECOND_NODE_SIGNER,
              wad: '1000',
            },
          );
        });
        it('signer2 approves NodeRegistryLogic contract to spend minDeposit tokens', async function () {
          block = await supportedTokenContractInstance.approve(
            nodeRegistryLogicContractInstance.address, minDeposit,
            { from: SECOND_NODE_SIGNER },
          );
          assert.equal(block.receipt.status, true, 'Transaction failed');
        });
        it('should check for emitting of Approve event', async function () {
          expectEvent(
            block.receipt,
            'Approval', {
              src: SECOND_NODE_SIGNER,
              guy: nodeRegistryLogicContractInstance.address,
              wad: '1000',
            },
          );
        });
        it('should register a node succesfully', async function () {
          block = await nodeRegistryLogicContractInstance.registerNode(
            SECOND_NODE_URL,
            SECOND_NODE_PROPS,
            SECOND_NODE_WEIGHT,
            SECOND_NODE_DEPOSIT,
            { from: SECOND_NODE_SIGNER },
          );
          assert.equal(block.receipt.status, true, 'Transaction failed');
        });
        it('should check for emitting of LogNodeRegistered event', async function () {
          expectEvent(
            block.receipt,
            'LogNodeRegistered', {
              url: SECOND_NODE_URL,
              props: '65534',
              signer: SECOND_NODE_SIGNER,
              deposit: '1000',
            },
          );
        });
      });
    });
  });

  describe('registerNodeFor', () => {
      
  });
});
