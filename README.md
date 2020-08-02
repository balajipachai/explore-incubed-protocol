# USE CASE

**Incubed** is a protocol to access blockchain information (for instance Ethereum) decentralized with a stateless but full verifying client. Nodes participating in this open network are registered in a **Registry Smart Contract**.

## TASK:

1. Please write a test application to investigate or list or visualize the information of the Registry contract or interact therewith (for instance list of nodes, security deposit, try to convict a node, ...).

2. It’s your choise – just do something meaningful!

3. The eth address of the Registry Contract is: 0x6C095A05764A23156eFD9D603eaDa144a9B1AF33.

4. You may use any language you feel fits best. Ideally, this would have some type of user interface.

5. What is decisive for our evaluation? Most import for our assessment is the quality of the code (not the amount of lines) – structure, meaningful use of technology, documentation, etc. We are particularly interested to learn how you test your program code.

    - We understand you are probably not an experienced blockchain expert yet (if you are, the better!) and have chosen a task achievable by anyone new to the space but experienced in software development. We are interested solely in becoming acquainted with your programming style, your ability to solve new problems, to verify the correctness of your solution, and your creativity.

**Be creative! Impress us! Show us that you are an extraordinary developer and that you belong in our team!**

***

### Understanding 

After going through the address of the Registry Contract `0x6C095A05764A23156eFD9D603eaDa144a9B1AF33` on Etherscan the set of smart contracts that make up / play a vital role in the functioning of the INCUBED protocol are as follows:
  1. NodeRegistryLogic.sol
  2. NodeRegistryData.sol
  3. BlockhashRegistry.sol
  4. IERC20.sol
  5. Proxy.sol (adminKey or Admin smart contract, that has the right to perform the admin level operations)
  6. WETH9.sol (supportedToken or an ERC20 implementation named as WrappedEther)

It all starts with the NodeRegistryLogic contract as it imports NodeRegistryData, BlockhashRegistry and IERC20 contracts and Proxy and WETH9 are set in the NodeRegistryLogic under the variable names adminKey and supportedToken.

***

## How I am approaching for a solution / a layout of interacting with the NodeRegistryLogic contract?

  1. Write test cases for the above listed contracts
  2. Generate a solidity code coverage report based on the test cases
  3. Develop an express server
  4. Expose the smart contract functionalities via APIs
  5. Use the INCUBED implementation in Typescript to interact with the smart contract
  6. Develop a bare minimum UI to display the smart contract functionalities like nodeList, deposit of a node, etc
  7. Test coverage reports are in server/coverage directory

***

### Client

For client side development I have preferred to use Angular. All the client side development files are in the client directory.

### Server

For server side development I have preferred to use Node.js. All the server side development files are in the server directory.
It also has the smart contracts, which were taken from Etherscan, the tests for the smart contracts, the APIs and interaction with the smart contracts using the INCUBED library.

***

### Contract Deployment Process

1. Deployed BlockhashRegistry() as its constructor takes 0 arguments.
2. Deployed NodeRegistryData() as its constructor takes 0 arguments.
3. Deployed NodeRegistryLogic() with parameters:
  - address(BlockhashRegistry)
  - address(NodeRegistryData)
  - minDeposit = 1000

  However, in `NodeRegistryData`, the `ownerContract` field should be equal to `NodeRegistryLogicContract` and `supportedToken` 
  should be equal to the ERC20 token through which deposits will be made.

  But, ownerContract is set during NodeRegistryData deployment, then how do we set it?
    - by calling `adminSetLogic(address(NodeRegistryLogic))` from the same account that deployed NodeRegistryData
    - and setting supportedToken field by calling `adminSetSupportedToken(tokenAddress)` from the same account that deployed NodeRegistryData

In this way the contracts have been deployed, thanks to Martin Küchler for helping out via email.
Now we are all set to test our deployed contracts.

***

### TESTS FOR THE CONTRACTS

The tests for the contracts are developed using mocha and chai and openzeppelin-test-helpers.

***

### NODEREGISTRYLOGIC CONTRACT DEPLOYED ADDRESSES ON KOVAN AND GOERLI NETWORK

1. NODEREGISTRY_LOGIC_DEPLOYED_ADDRESS_GOERLI = `0xc4DB1aF5365F14d622AFb7e90a5B9c29C3Bf6D6E`
2. NODEREGISTRY_LOGIC_DEPLOYED_ADDRESS_KOVAN = `0xc4DB1aF5365F14d622AFb7e90a5B9c29C3Bf6D6E`
3. On KOVAN & GOERLI SET THE adminSetSupportedToken() & adminSetLogic() using Remix IDE and Injected Web3

***

### IMPROVEMENTS

1. In my opinion in NodeRegistryLogic.sol at line no: 477 and line no: 540 are additional require statement which is not needed, I have added comments in the contract too.

2. In NodeRegistryLogic.sol in transferOwnership(address _signer, address _newOwner) signerRequire statement is extraneous

    1. require(in3Node.signer == _signer, "wrong signer");  (signerRequire)
    2. require(si.stage == uint256(Stages.Active), "wrong stage"); (stageRequire)
    3. require(si.owner == msg.sender, "not the owner"); (ownerRequire)

      - The signerRequire is extraneous, and should be removed, let me answer it why?

      - Since, we pass in _signer as one of the arguments to `transferOwnerhsip(address _signer, address _newOwner)`, in
      order for `signerRequire` to fail, it must pass `stageRequire` and here notice that the `_signer` passed to the functiona can `exist` or `not exist`, in both the cases the execution will not reach `signerRequire`

      1. If a signer does not exists, in that case the `stageRequire` will fail, thus, reverting from there.
      2. If a signer exists and is different than the current node signer, in that case the `ownerRequire` will fail, thus, reverting from there.

      Thus in my opinion, the `signerRequire` should be removed from the contract, as it causes an overhead of one more execution to be executed by the EVM and nothing else.

3. Point 2. is also applicable to `updateNode()` `signerRequire`

4. In `updateNode`() call to `_checkNodePropertiesInternal()` is not required, why?
  - BELOW CALL IS NOT REQUIIRED, AS WHILE ADDING THE NODE i.e. registerNode() WE HAVE ALREADY PERFORMED the checking the node internal properties

5. Point 2. is also applicable to `unregisteringNode()` `signerRequire`

6. THE Transaction Object in case if it's not provided the value for `gas` then the `in3-wasm` library fails at in3-wasm/index.js Line No: 1511 which is `tx.gas = util.toMinHex(args.gas || (api && (toNumber(await api.estimateGas(tx)) + 1000) || 3000000))`.
Thus the doc should be updated with transaction object to contain `gas` field as compulsory.

7. Added three external functions in NewNodeRegistryLogic contracts `getSignerInfo(address _signer)`, `getIn3NodeInfoByIndex(uint256 _index)` and `getIn3NodeInfoBySigner(uint256 _signer)`.
  - Why these functions were needed?
    - Returning an entire structure on Goerli caused `Memory: out of bounds` error, thus, added these functions which returns basic types rather than the entire structure.
    - This NewNodeRegistryLogic contract has been deployed on `goerli & kovan` and `adminUpdateLogic()` on both have been submitted.
    - New NodeRegistryLogic contract is deployed on Goerli at `0x4DF6EA1Bb1E92C71C3AEe75AfbFe8191C0c17e65` and on Kovan at `0xdbcBe1b1e89448409fF25f0e4e7Dba9D32fB5FB6`


### TEST CASES THAT ARE FAILING

I have tried writing the test case for registerNodeFor(), however, it is failing, and the reason I could get close to is 
the keccak256() calculated inside solidity and the one that is calculated using web3.utils.soliditySha3() are not behaving the same.

#### How I got to the above conclusion?

Added a verify() function in NodeRegistryLogic contract

```javascript
function verify(
        bytes32 hash,
        uint8 v,
        bytes32 r,
        bytes32 s,
        address _signer,
        address sender
    ) public view returns (bool) {
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        bytes32 prefixedHash = keccak256(abi.encodePacked(prefix, hash));
        address signer = ecrecover(prefixedHash, v, r, s);
        require(
            _signer == signer,
            "not the correct signature of the signer provided"
        );
        return true;
    }

Called it from the test case as below:

const tempHash = web3.utils.soliditySha3(
          THIRD_NODE_URL,
          THIRD_NODE_PROPS,
          THIRD_NODE_WEIGHT,
          thirdOwner,
        );
        const {
          v, r, s,
        } = web3.eth.accounts.sign(
          tempHash, '0xe0c673c2ab481fa2989b6da6098a3608fd2750c7c363a0093dcfcf18191ceb60',
        );
        console.log('Are keys matching: ', await nodeRegistryLogicContractInstance.verify(
          THIRD_NODE_SIGNER,
          v, r, s,
        ));

Here it returned true.
```

Then in order to mimic the exact behaviour of 

```javascript
function verify(
        string memory _url,
        uint192 _props,
        uint64 _weight,
        uint8 v,
        bytes32 r,
        bytes32 s,
        address _signer,
        address sender
    ) public view returns (bool) {
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        bytes32 hash = keccak256(
            abi.encodePacked(_url, _props, _weight, sender)
        );
        bytes32 prefixedHash = keccak256(abi.encodePacked(prefix, hash));
        address signer = ecrecover(prefixedHash, v, r, s);

        require(
            _signer == signer,
            "not the correct signature of the signer provided"
        );
        return true;
    }

Again called it as I did in the above case however, this time passed url, props, weight, etc the required params, and it reverted in this case.
```
***

### APIs Developed

1. [AdminUpdateLogic](http://localhost:3000/noderegistrylogic/admin/update/logic)
2. [AdminRemoveNodeFromRegistry](http://localhost:3000/noderegistrylogic/admin/remove/node)
3. [RegisterNode](http://localhost:3000/noderegistrylogic/register/node)
4. [ActivateNewLogic](http://localhost:3000/noderegistrylogic/activate/new/logic/contract)
5. [ReturnDeposits](http://localhost:3000/noderegistrylogic/return/deposits)
6. [TransferNodeOwnership](http://localhost:3000/noderegistrylogic/transfer/ownership)
7. [UpdateIN3Node](http://localhost:3000/noderegistrylogic/update/node)
8. [UnregisterIN3Node](http://localhost:3000/noderegistrylogic/unregister/node)
9. DepositToken
10. ApproveToken 

For APIs 9 & 10, there was no need of explicit endpoints as they are used internally when registering node, updating node etc.

#### The key point is of performing a read request via IN3 Node and then a write request via IN3 node, and all these APIs revolve around those two, for instance in case of GET APIs (Read from Blockchain) we use in3.eth.callFn() & in case of POST APIs (Write To Blockchain) we use in3.eth.sendTransaction()

***

# For Setting up Clien & Server, and proceeding with testing

### Clone the repository

git clone https://github.com/balajipachai/explore-incubed-protocol.git

## Client

1. cd client
2. npm install
3. npm run start (Will Launch the server on port 4200)

## Server

1. Ensure RabbitMQ is installed [Install RabbitMQ](https://www.rabbitmq.com/install-debian.html)
   As `rabbitmq` is used for submitting transactions to the blockchain network and ensuring all transactions are submitted to the network and are mined.

2. cd server
3. npm install
4. npm run dev:server OR
5. npm run start

***
