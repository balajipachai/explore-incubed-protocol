/* eslint-disable mocha/no-setup-in-describe */
/* eslint-disable no-undef */
/* eslint-disable node/no-unpublished-require */
/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */

const {
  constants,
  expectEvent,
  expectRevert,
  time,
} = require('@openzeppelin/test-helpers');
const { assert } = require('chai');
const BigNumber = require('bignumber.js');
const Web3 = require('web3');
// LOCAL GANACHE PROVIDER
const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));

const BlockhashRegistry = artifacts.require('BlockhashRegistry');
const NodeRegistryData = artifacts.require('NodeRegistryData');
const NodeRegistryLogic = artifacts.require('NodeRegistryLogic');
const WETH9 = artifacts.require('WETH9');

contract('NodeRegistryLogic', function (accounts) {
  const [coinbase, account1, signer1, signer2, signer3, signer4] = accounts;
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

  const THIRD_NODE_URL = 'https://mybootnode-C.com';
  const THIRD_NODE_PROPS = 61254;
  const THIRD_NODE_WEIGHT = 27;
  const THIRD_NODE_DEPOSIT = minDeposit;
  const THIRD_NODE_SIGNER = signer3;

  const FOURTH_NODE_URL = 'https://mybootnode-D.com';
  const FOURTH_NODE_PROPS = 61214;
  const FOURTH_NODE_WEIGHT = 75;
  const FOURTH_NODE_DEPOSIT = minDeposit;
  const FOURTH_NODE_SIGNER = signer4;

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
      let blockHashMapping;
      let blockNumber;
      context('searchForAvailableBlock', function () {
        it('should get the closest snapshot', async function () {
          const latestBlock = await time.latestBlock();
          blockNumber = await blockhashRegistryContractInstance.searchForAvailableBlock
            .call(0, latestBlock);
          assert.notEqual(blockNumber, 0, 'BlockNumber do not match');
        });
        it('should check blockHashMapping is non-zero bytes32', async function () {
          blockHashMapping = await blockhashRegistryContractInstance.blockhashMapping
            .call(blockNumber);
          assert.notEqual(blockHashMapping, constants.ZERO_BYTES32, 'Block hash mapping do not match');
        });
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
        it('should check the supportedToken to be WETH9', async function () {
          const erc20Token = await nodeRegistryLogicContractInstance.supportedToken.call();
          assert.equal(erc20Token, supportedTokenContractInstance.address, 'Token address do not match');
        });
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
            'Deposit',
            {
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
        it('should check for emitting of Approval event', async function () {
          expectEvent(
            block.receipt,
            'Approval',
            {
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
            'LogNodeRegistered',
            {
              url: FIRST_NODE_URL,
              props: '65535',
              signer: FIRST_NODE_SIGNER,
              deposit: '1000',
            },
          );
        });
        it('should check the node has been registered successfully', async function () {
          const signerInfo = await nodeRegistryDataContractInstance.getSignerInformation.call(
            FIRST_NODE_SIGNER,
          );
          assert.equal(signerInfo[2], '1', 'Node registration failed.');
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
            'Deposit',
            {
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
        it('should check for emitting of Approval event', async function () {
          expectEvent(
            block.receipt,
            'Approval',
            {
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
            'LogNodeRegistered',
            {
              url: SECOND_NODE_URL,
              props: '65534',
              signer: SECOND_NODE_SIGNER,
              deposit: '1000',
            },
          );
        });
      });

      context('FOR THIRD NODE', function () {
        it('Deposit minimum deposit into WETH9 contract from signer3', async function () {
          block = await supportedTokenContractInstance.deposit({
            from: THIRD_NODE_SIGNER,
            value: minDeposit,
          });
          assert.equal(block.receipt.status, true, 'Transaction failed');
        });
        it('should check for emitting of Deposit event', async function () {
          expectEvent(
            block.receipt,
            'Deposit',
            {
              dst: THIRD_NODE_SIGNER,
              wad: '1000',
            },
          );
        });
        it('signer3 approves NodeRegistryLogic contract to spend minDeposit tokens', async function () {
          block = await supportedTokenContractInstance.approve(
            nodeRegistryLogicContractInstance.address, minDeposit,
            { from: THIRD_NODE_SIGNER },
          );
          assert.equal(block.receipt.status, true, 'Transaction failed');
        });
        it('should check for emitting of Approval event', async function () {
          expectEvent(
            block.receipt,
            'Approval',
            {
              src: THIRD_NODE_SIGNER,
              guy: nodeRegistryLogicContractInstance.address,
              wad: '1000',
            },
          );
        });
        it('should register a node succesfully', async function () {
          block = await nodeRegistryLogicContractInstance.registerNode(
            THIRD_NODE_URL,
            THIRD_NODE_PROPS,
            THIRD_NODE_WEIGHT,
            THIRD_NODE_DEPOSIT,
            { from: THIRD_NODE_SIGNER },
          );
          assert.equal(block.receipt.status, true, 'Transaction failed');
        });
        it('should check for emitting of LogNodeRegistered event', async function () {
          expectEvent(
            block.receipt,
            'LogNodeRegistered',
            {
              url: THIRD_NODE_URL,
              props: THIRD_NODE_PROPS.toString(),
              signer: THIRD_NODE_SIGNER,
              deposit: '1000',
            },
          );
        });
      });

      context('FOR FOURTH NODE', function () {
        it('Deposit minimum deposit into WETH9 contract from signer4', async function () {
          block = await supportedTokenContractInstance.deposit({
            from: FOURTH_NODE_SIGNER,
            value: minDeposit,
          });
          assert.equal(block.receipt.status, true, 'Transaction failed');
        });
        it('should check for emitting of Deposit event', async function () {
          expectEvent(
            block.receipt,
            'Deposit',
            {
              dst: FOURTH_NODE_SIGNER,
              wad: '1000',
            },
          );
        });
        it('signer4 approves NodeRegistryLogic contract to spend minDeposit tokens', async function () {
          block = await supportedTokenContractInstance.approve(
            nodeRegistryLogicContractInstance.address, minDeposit,
            { from: FOURTH_NODE_SIGNER },
          );
          assert.equal(block.receipt.status, true, 'Transaction failed');
        });
        it('should check for emitting of Approval event', async function () {
          expectEvent(
            block.receipt,
            'Approval',
            {
              src: FOURTH_NODE_SIGNER,
              guy: nodeRegistryLogicContractInstance.address,
              wad: '1000',
            },
          );
        });
        it('should register a node succesfully', async function () {
          block = await nodeRegistryLogicContractInstance.registerNode(
            FOURTH_NODE_URL,
            FOURTH_NODE_PROPS,
            FOURTH_NODE_WEIGHT,
            FOURTH_NODE_DEPOSIT,
            { from: FOURTH_NODE_SIGNER },
          );
          assert.equal(block.receipt.status, true, 'Transaction failed');
        });
        it('should check for emitting of LogNodeRegistered event', async function () {
          expectEvent(
            block.receipt,
            'LogNodeRegistered',
            {
              url: FOURTH_NODE_URL,
              props: FOURTH_NODE_PROPS.toString(),
              signer: FOURTH_NODE_SIGNER,
              deposit: '1000',
            },
          );
        });
        it('should check the totalNodes to be 4', async function () {
          const total = await nodeRegistryLogicContractInstance.totalNodes.call();
          assert.equal(total.toNumber(), 4, 'Total nodes do not match');
        });
      });

      context('WETH9 functions', function () {
        it('should check totalSupply to be > 0', async function () {
          const supply = await supportedTokenContractInstance.totalSupply.call();
          assert.notEqual(supply.toNumber(), 0, 'Total supply do not match');
        });
        it('should revert when trying to withdraw more than the deposited amount', async function () {
          await expectRevert(
            supportedTokenContractInstance.withdraw(2500, { from: FIRST_NODE_SIGNER }),
            'Insufficient balance in withdraw',
          );
        });
        it('should be able to deposit and withdraw tokens', async function () {
          await supportedTokenContractInstance.deposit({ from: FIRST_NODE_SIGNER, value: 30 });
          block = await supportedTokenContractInstance.withdraw(29, { from: FIRST_NODE_SIGNER });
          assert.equal(block.receipt.status, true, 'Transaction failed');
        });
        it('should check for Withdrawal event being emitted', async function () {
          expectEvent(
            block.receipt,
            'Withdrawal',
            {
              src: FIRST_NODE_SIGNER,
              wad: '29',
            },
          );
        });
      });
    });
  });

  describe('registerNodeFor', function () {
    const [, , , , , , fifthOwner, signer5] = accounts;
    const FIFTH_NODE_URL = 'https://mybootnode-E.com';
    const FIFTH_NODE_PROPS = 65530;
    const FIFTH_NODE_WEIGHT = 23;
    const FIFTH_NODE_DEPOSIT = 1250;
    const FIFTH_NODE_SIGNER = signer5;
    let V;
    let R;
    let S;

    before(async function () {
      const tempHash = web3.utils.soliditySha3(
        FIFTH_NODE_URL,
        FIFTH_NODE_PROPS,
        FIFTH_NODE_WEIGHT,
        FIFTH_NODE_SIGNER,
      );
      const prefixedHash = web3.utils.soliditySha3(
        '\x19Ethereum Signed Message:\n32',
        tempHash,
      );
      const { v, r, s } = web3.eth.accounts.sign(
        prefixedHash, '0xe0c673c2ab481fa2989b6da6098a3608fd2750c7c363a0093dcfcf18191ceb60',
      );
      V = v;
      R = r;
      S = s;
      await supportedTokenContractInstance.deposit({
        from: fifthOwner,
        value: FIFTH_NODE_DEPOSIT,
      });
      await supportedTokenContractInstance.approve(
        nodeRegistryLogicContractInstance.address, FIFTH_NODE_DEPOSIT,
        { from: fifthOwner },
      );
    });

    context('reverts', function () {
      it('should revert when v is neither 27 nor 28', async function () {
        await expectRevert(
          nodeRegistryLogicContractInstance.registerNodeFor(
            FIFTH_NODE_URL,
            FIFTH_NODE_PROPS,
            FIFTH_NODE_SIGNER,
            FIFTH_NODE_WEIGHT,
            FIFTH_NODE_DEPOSIT,
            39,
            R,
            S,
            { from: fifthOwner },
          ),
          'invalid signature',
        );
      });

      it('should revert when incorrect signature is provided', async function () {
        await expectRevert(
          nodeRegistryLogicContractInstance.registerNodeFor(
            FIFTH_NODE_URL,
            FIFTH_NODE_PROPS,
            FIFTH_NODE_SIGNER,
            FIFTH_NODE_WEIGHT,
            FIFTH_NODE_DEPOSIT,
            V,
            R,
            S,
            { from: fifthOwner },
          ),
          'not the correct signature of the signer provided',
        );
      });
    });

    // context('success', function () {
    //   before(async function () {
    //     const tempHash = web3.utils.soliditySha3(
    //       THIRD_NODE_URL,
    //       THIRD_NODE_PROPS,
    //       THIRD_NODE_WEIGHT,
    //       fifthOwner,
    //     );
    //     const {
    //       v, r, s,
    //     } = web3.eth.accounts.sign(
    //       tempHash, '0xe0c673c2ab481fa2989b6da6098a3608fd2750c7c363a0093dcfcf18191ceb60',
    //     );
    //     console.log('Are keys matching: ', await nodeRegistryLogicContractInstance.verify(
    //       THIRD_NODE_URL,
    //       THIRD_NODE_PROPS,
    //       THIRD_NODE_WEIGHT,
    //       v, r, s, THIRD_NODE_SIGNER,
    //       fifthOwner,
    //     ));
    //     V = v;
    //     R = r;
    //     S = s;
    //   });
    //   it('should register a node succesfully', async function () {
    //     console.log(V, R, S);
    //     block = await nodeRegistryLogicContractInstance.registerNodeFor(
    //       THIRD_NODE_URL,
    //       THIRD_NODE_PROPS,
    //       THIRD_NODE_SIGNER,
    //       THIRD_NODE_WEIGHT,
    //       THIRD_NODE_DEPOSIT,
    //       V,
    //       R,
    //       S,
    //       { from: fifthOwner },
    //     );
    //     assert.equal(block.receipt.status, true, 'Transaction failed');
    //   });
    //   it('should check for emitting of LogNodeRegistered event', async function () {
    //     expectEvent(
    //       block.receipt,
    //       'LogNodeRegistered', {
    //       url: THIRD_NODE_URL,
    //       props: '65530',
    //       signer: THIRD_NODE_SIGNER,
    //       deposit: '1250',
    //     },
    //     );
    //   });
    // });
  });

  describe('transferOwnership', function () {
    const [, , , , , , , , newOwner, dummySigner] = accounts;
    context('reverts', function () {
      it('when new owner is address 0', async function () {
        await expectRevert(
          nodeRegistryLogicContractInstance.transferOwnership(
            FIRST_NODE_SIGNER,
            constants.ZERO_ADDRESS,
            { from: FIRST_NODE_SIGNER },
          ),
          '0x0 not allowed',
        );
      });
      it('when caller is not the owner', async function () {
        await expectRevert(
          nodeRegistryLogicContractInstance.transferOwnership(
            FIRST_NODE_SIGNER,
            newOwner,
            { from: newOwner },
          ),
          'not the owner',
        );
      });
      it('in case of wrong stage', async function () {
        await expectRevert(
          nodeRegistryLogicContractInstance.transferOwnership(
            dummySigner,
            newOwner,
            { from: FIRST_NODE_SIGNER },
          ),
          'wrong stage',
        );
      });
      it('in case wrong signer', async function () {
        assert.ok('The else path for require will never be called');
      });
    });
    context('success', function () {
      it('should transfer ownership successfully', async function () {
        block = await nodeRegistryLogicContractInstance.transferOwnership(
          FIRST_NODE_SIGNER,
          newOwner,
          { from: FIRST_NODE_SIGNER },
        );
        assert.equal(block.receipt.status, true, 'Transaction failed');
      });
      it('should check for LogOwnershipChanged event', async function () {
        expectEvent(
          block.receipt,
          'LogOwnershipChanged',
          {
            signer: FIRST_NODE_SIGNER,
            oldOwner: FIRST_NODE_SIGNER,
            newOwner,
          },
        );
      });
      it('should check the owner has changed', async function () {
        const details = await nodeRegistryDataContractInstance.getSignerInformation.call(
          FIRST_NODE_SIGNER,
        );
        assert.equal(details[1], newOwner, 'Owner has not changed');
      });
    });
  });

  describe('updateNode', function () {
    const [, , , , , , , , newOwner, dummySigner] = accounts;
    const ADDITIONAL_DEPOSIT = 120;
    context('reverts', function () {
      it('in case of wrong stage', async function () {
        await expectRevert(
          nodeRegistryLogicContractInstance.updateNode(
            dummySigner,
            FIRST_NODE_URL,
            FIRST_NODE_PROPS,
            FIRST_NODE_WEIGHT,
            ADDITIONAL_DEPOSIT,
            { from: FIRST_NODE_SIGNER },
          ),
          'wrong stage',
        );
      });
      it('when caller is not the owner', async function () {
        await expectRevert(
          nodeRegistryLogicContractInstance.updateNode(
            FIRST_NODE_SIGNER,
            FIRST_NODE_URL,
            FIRST_NODE_PROPS,
            FIRST_NODE_WEIGHT,
            ADDITIONAL_DEPOSIT,
            { from: dummySigner },
          ),
          'not the owner',
        );
      });
      it('in case of wrong signer', async function () {
        assert.ok('The else path for require will never be called');
      });
    });
    context('success', function () {
      before(async function () {
        // ADDITIONAL DEPOSIT TO PASS
        // DEPOSIT
        await supportedTokenContractInstance.deposit({
          from: newOwner,
          value: ADDITIONAL_DEPOSIT,
        });

        // APPROVE
        await supportedTokenContractInstance.approve(
          nodeRegistryLogicContractInstance.address, ADDITIONAL_DEPOSIT,
          { from: newOwner },
        );
      });
      it('should update node successfully', async function () {
        block = await nodeRegistryLogicContractInstance.updateNode(
          FIRST_NODE_SIGNER,
          FIRST_NODE_URL,
          FIRST_NODE_PROPS,
          FIRST_NODE_WEIGHT,
          ADDITIONAL_DEPOSIT,
          { from: newOwner },
        );
        assert.equal(block.receipt.status, true, 'Transaction failed');
      });
      it('should check for LogNodeUpdated event', async function () {
        expectEvent(
          block.receipt,
          'LogNodeUpdated',
          {
            url: FIRST_NODE_URL,
            props: FIRST_NODE_PROPS.toString(),
            signer: FIRST_NODE_SIGNER,
            deposit: (minDeposit + ADDITIONAL_DEPOSIT).toString(),
          },
        );
      });
    });
  });

  describe('unregisteringNode', function () {
    const [, , , , , , , , newOwner, dummySigner] = accounts;
    context('reverts', function () {
      it('in case of wrong stage', async function () {
        await expectRevert(
          nodeRegistryLogicContractInstance.unregisteringNode(
            dummySigner,
            { from: FIRST_NODE_SIGNER },
          ),
          'wrong stage',
        );
      });
      it('when caller is not the owner', async function () {
        await expectRevert(
          nodeRegistryLogicContractInstance.unregisteringNode(
            FIRST_NODE_SIGNER,
            { from: dummySigner },
          ),
          'not the owner',
        );
      });
      it('in case of wrong signer', async function () {
        assert.ok('The else path for require will never be called');
      });
    });
    context('success', function () {
      it('should unregister a node successfully', async function () {
        block = await nodeRegistryLogicContractInstance.unregisteringNode(
          FIRST_NODE_SIGNER,
          { from: newOwner },
        );
        assert.equal(block.receipt.status, true, 'Transaction failed');
      });
      it('should check for LogNodeUpdated event', async function () {
        expectEvent(
          block.receipt,
          'LogNodeRemoved',
          {
            url: FIRST_NODE_URL,
            signer: FIRST_NODE_SIGNER,
          },
        );
      });
      it('should check the node has been unregistered', async function () {
        const details = await nodeRegistryDataContractInstance.getSignerInformation.call(
          FIRST_NODE_SIGNER,
        );
        assert.equal(details[2], '3', 'Node not removed');
      });
    });
  });

  describe('returnDeposit', function () {
    const [, , , , , , , , newOwner, dummySigner] = accounts;
    context('reverts', function () {
      it('in case of wrong stage', async function () {
        await expectRevert(
          nodeRegistryLogicContractInstance.returnDeposit(
            SECOND_NODE_SIGNER,
            { from: SECOND_NODE_SIGNER },
          ),
          'wrong stage',
        );
      });
      it('when caller is not the owner', async function () {
        await expectRevert(
          nodeRegistryLogicContractInstance.returnDeposit(
            FIRST_NODE_SIGNER,
            { from: dummySigner },
          ),
          'not the owner of the node',
        );
      });
      it('when deposit is still locked', async function () {
        await expectRevert(
          nodeRegistryLogicContractInstance.returnDeposit(
            FIRST_NODE_SIGNER,
            { from: newOwner },
          ),
          'deposit still locked',
        );
      });
    });
    context('success', function () {
      before(async function () {
        // should increase time by 40 days s.t. deposit succeeds
        const currentTime = await time.latest();
        // 86400 - Seconds In a Day
        const forwardTimeBy = (currentTime.toNumber() + (41 * 86400));
        await time.increaseTo(forwardTimeBy);
      });
      it('should return deposit successfully', async function () {
        block = await nodeRegistryLogicContractInstance.returnDeposit(
          FIRST_NODE_SIGNER,
          { from: newOwner },
        );
        assert.equal(block.receipt.status, true, 'Transaction failed');
      });
      it('should check for LogDepositReturned event', async function () {
        expectEvent(
          block.receipt,
          'LogDepositReturned',
          {
            signer: FIRST_NODE_SIGNER,
            owner: newOwner,
            deposit: '1120',
            erc20Token: supportedTokenContractInstance.address,
          },
        );
      });
      context('should check deposits returned', function () {
        let signerDetails;
        before(async function () {
          signerDetails = await nodeRegistryDataContractInstance.getSignerInformation.call(
            FIRST_NODE_SIGNER,
          );
        });
        it('the lockedTime should be 0', async function () {
          assert.equal(signerDetails[0], '0', 'Locked time is not zero');
        });
        it('the owner should be address(0)', async function () {
          assert.equal(signerDetails[1], constants.ZERO_ADDRESS, 'Owner is not address(0)');
        });
        it('the stage should be 0', async function () {
          assert.equal(signerDetails[2], '0', 'Stage is not zero');
        });
        it('the depositAmount should be 0', async function () {
          assert.equal(signerDetails[3], '0', 'Deposit amount is not zero');
        });
        it('the index should be 0', async function () {
          assert.equal(signerDetails[4], '0', 'Index is not zero');
        });
      });
    });
  });

  describe('adminRemoveNodeFromRegistry', function () {
    const [, , , , , , , , dummySigner] = accounts;
    let adminKey;
    before(async function () {
      adminKey = await nodeRegistryLogicContractInstance.adminKey.call();
    });
    context('reverts', function () {
      it('in case of wrong stage', async function () {
        await expectRevert(
          nodeRegistryLogicContractInstance.adminRemoveNodeFromRegistry(
            dummySigner,
            { from: adminKey },
          ),
          'wrong stage',
        );
      });
      it('when caller is not the admin', async function () {
        await expectRevert(
          nodeRegistryLogicContractInstance.adminRemoveNodeFromRegistry(
            THIRD_NODE_SIGNER,
            { from: dummySigner },
          ),
          'not the admin',
        );
      });
    });
    context('success', function () {
      it('should unregister a node by admin successfully', async function () {
        block = await nodeRegistryLogicContractInstance.adminRemoveNodeFromRegistry(
          THIRD_NODE_SIGNER,
          { from: adminKey },
        );
        assert.equal(block.receipt.status, true, 'Transaction failed');
      });
      it('should check for LogNodeRemoved event', async function () {
        expectEvent(
          block.receipt,
          'LogNodeRemoved',
          {
            url: THIRD_NODE_URL,
            signer: THIRD_NODE_SIGNER,
          },
        );
      });
      it('should check the node has been removed by admin successfully', async function () {
        const details = await nodeRegistryDataContractInstance.getSignerInformation.call(
          THIRD_NODE_SIGNER,
        );
        assert.equal(details[2], '3', 'Node not removed');
      });
    });
  });

  describe('convict', function () {
    const [, , , , , , , , convictSubmitter] = accounts;
    const wrongBlockHash = '0xf543410ea7656c24fe24e90a04fd47c46aa9f036b53aaf48322848a297ed10fa';
    it('before convict submission the convictMapping should be = 0', async function () {
      const convictMapping = await nodeRegistryDataContractInstance.convictMapping.call(
        convictSubmitter,
        wrongBlockHash,
      );
      assert.equal(convictMapping.toNumber(), 0, 'Convict mapping do not match');
    });
    it('should submit convict request', async function () {
      block = await nodeRegistryLogicContractInstance.convict(
        wrongBlockHash, { from: convictSubmitter },
      );
      assert.equal(block.receipt.status, true, 'Transaction failed');
    });
    it('after convict submission the convictMapping should be > 0', async function () {
      const convictMapping = await nodeRegistryDataContractInstance.convictMapping.call(
        convictSubmitter,
        wrongBlockHash,
      );
      assert.notEqual(convictMapping.toNumber(), 0, 'Convict mapping do not match');
    });
  });

  describe('revealConvict', function () {
    const [, , , , , , , , convictSubmitter] = accounts;
    const wrongBlockHash = '0xf543410ea7656c24fe24e90a04fd47c46aa9f036b53aaf48322848a297ed10fa';
    const blockNumber = 59;
    const v = '0x1b';
    const r = '0x876f9e052d627e9a6fd45a6f07bb99731ecace5678a88432b3bf7e6f6f250930';
    const s = '0xfb08335d965873460ca3b6d77e2c3eeaac24de4c644b2c0405cb7af250ac00a';
    const signer = '0x0ad6a4a3fd5254382533f73e485ab4ebe24e783f';
    context('reverts', function () {
      it('reverts when block not found', async function () {
        expectRevert(nodeRegistryLogicContractInstance.revealConvict(
          signer,
          wrongBlockHash,
          blockNumber,
          v,
          r,
          s,
          { from: convictSubmitter },
        ), 'wrong convict hash'); // 'wrong convict hash' 'block not found'
      });
    });
  });

  describe('Cover the else path of If in updateNode', function () {
    it('should update node successfully', async function () {
      block = await nodeRegistryLogicContractInstance.updateNode(
        SECOND_NODE_SIGNER,
        `${SECOND_NODE_URL}Test`,
        SECOND_NODE_PROPS,
        SECOND_NODE_WEIGHT,
        0,
        { from: SECOND_NODE_SIGNER },
      );
      assert.equal(block.receipt.status, true, 'Transaction failed');
    });
  });

  describe('activateNewLogic', function () {
    let adminKey;
    before(async function () {
      adminKey = await nodeRegistryLogicContractInstance.adminKey.call();
    });
    it('reverts when timeout is not set', async function () {
      await expectRevert(
        nodeRegistryLogicContractInstance.activateNewLogic(),
        'no timeout set',
      );
    });
    context('adminUpdateLogic', function () {
      const [, , , , , , , , , newLogic] = accounts;
      it('reverts when called by non-admin', async function () {
        await expectRevert(
          nodeRegistryLogicContractInstance.adminUpdateLogic(newLogic, { from: newLogic }),
          'not the admin',
        );
      });
      it('reverts when new logic is address(0)', async function () {
        await expectRevert(
          nodeRegistryLogicContractInstance.adminUpdateLogic(
            constants.ZERO_ADDRESS, { from: adminKey },
          ),
          '0x address not supported',
        );
      });
      it('successfully updates new logic', async function () {
        block = await nodeRegistryLogicContractInstance.adminUpdateLogic(
          newLogic, { from: adminKey },
        );
        assert.equal(block.receipt.status, true, 'Transaction failed');
      });
      it('should check LogNewPendingContract event is emitted', async function () {
        expectEvent(
          block.receipt,
          'LogNewPendingContract',
          {
            newPendingContract: newLogic,
          },
        );
      });
      it('reverts when timeout is not yet over', async function () {
        await expectRevert(
          nodeRegistryLogicContractInstance.activateNewLogic(),
          'timeout not yet over',
        );
      });
      it('should check admin logic has been updated', async function () {
        const updatedLogic = await nodeRegistryLogicContractInstance.pendingNewLogic.call();
        assert.equal(updatedLogic, newLogic, 'Logic addresses do not match');
      });
      it('should check updated timeout is not 0', async function () {
        const updateTimeout = await nodeRegistryLogicContractInstance.updateTimeout.call();
        assert.notEqual(updateTimeout.toNumber(), 0, 'Updated timeout is not zero');
      });
      it('should activate new logic', async function () {
        const currentTime = await time.latest();
        // SINCE NEW LOGIC ACTIVATES AFTER 47 DAYS, THUS FORWARDED THE TIME BY 48 DAYS
        const forwardTimeBy = currentTime.toNumber() + (48 * 86400);
        await time.increaseTo(forwardTimeBy);
        block = await nodeRegistryLogicContractInstance.activateNewLogic();
        assert.equal(block.receipt.status, true, 'Transaction failed');
      });
    });
  });
});
