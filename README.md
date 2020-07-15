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

***