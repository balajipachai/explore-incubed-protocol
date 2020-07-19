const express = require('express');

const router = express.Router();

const gateway = require('../controller/');
const logger = require('../config/winston');
/**
 * Route that adds the Punch tool details into the database
 */
router.get('/', (req, res) => {
  res.json({ title: 'Blockchains/Slock.it | Exploring INCUBED Protocol' });
});

/**
 * Route that updates the NodeRegistryLogic to a new one
 * Only Admin can execute this
 */
router.post('/noderegistrylogic/admin/update/logic', async (req, res) => {
  try {
    const data = await gateway.nodeRegistryLogicAdminUpdateLogic(req.body);
    res.json({
      status: 'success',
      message: 'Admin updated logic successfully',
      data,
    });
  } catch (e) {
    logger.error('Error in admin update logic', e);
    res.json({
      status: 'failure',
      message: 'Updating admin logic failed',
      data: [],
    });
  }
});

/**
 * Route that removes a node from the registry
 * * Only Admin can execute this
 */
router.post('/noderegistrylogic/admin/remove/node', async (req, res) => {
  try {
    const data = await gateway.nodeRegistryLogicAdminRemoveNodeFromRegistry(req.body);
    res.json({
      status: 'success',
      message: 'Admin removed node successfully',
      data,
    });
  } catch (e) {
    logger.error('Error in admin removing node', e);
    res.json({
      status: 'failure',
      message: 'Admin removing node failed',
      data: [],
    });
  }
});

/**
 * Route to register a IN3 Ndoe
 */
router.post('/noderegistrylogic/register/node', async (req, res) => {
  try {
    const data = await gateway.nodeRegistryLogicRegisterNode(req.body);
    res.json({
      status: 'success',
      message: 'Node registered successfully',
      data,
    });
  } catch (e) {
    logger.error('Error in registering a node', e);
    res.json({
      status: 'failure',
      message: 'Registering a node failed',
      data: [],
    });
  }
});

/**
 * Route to activate new logic contract
 */
router.post('/noderegistrylogic/activate/new/logic/contract', async (req, res) => {
  try {
    const data = await gateway.nodeRegistryLogicActivateNewLogicContract(req.body);
    res.json({
      status: 'success',
      message: 'New logic activated successfully',
      data,
    });
  } catch (e) {
    logger.error('Error in activating new logic', e);
    res.json({
      status: 'failure',
      message: 'New logic activation failed',
      data: [],
    });
  }
});

/**
 * Route to return deposits of the signer
 */
router.post('/noderegistrylogic/return/deposits', async (req, res) => {
  try {
    const data = await gateway.nodeRegistryLogicReturnDeposits(req.body);
    res.json({
      status: 'success',
      message: 'Deposit returned successfully',
      data,
    });
  } catch (e) {
    logger.error('Error in returning deposits', e);
    res.json({
      status: 'failure',
      message: 'Deposit returned failed',
      data: [],
    });
  }
});

/**
 * Route to transfer ownership of an IN3 Node
 */
router.post('/noderegistrylogic/transfer/ownership', async (req, res) => {
  try {
    const data = await gateway.nodeRegistryLogicTransferIN3NodeOwnership(req.body);
    res.json({
      status: 'success',
      message: 'IN3 node ownership transferred successfully',
      data,
    });
  } catch (e) {
    logger.error('Error in IN3 node ownership transfer', e);
    res.json({
      status: 'failure',
      message: 'IN3 node ownership transfer failed',
      data: [],
    });
  }
});

/**
 * Route to unregister a IN3 Ndoe
 */
router.post('/noderegistrylogic/unregister/node', async (req, res) => {
  try {
    const data = await gateway.nodeRegistryLogicUnregisterIN3Node(req.body);
    res.json({
      status: 'success',
      message: 'IN3 node unregistered successfully',
      data,
    });
  } catch (e) {
    logger.error('Error in IN3 node unregistration', e);
    res.json({
      status: 'failure',
      message: 'IN3 node unregistration failed',
      data: [],
    });
  }
});

/**
 * Route to update a IN3 Ndoe
 */
router.post('/noderegistrylogic/update/node', async (req, res) => {
  try {
    const data = await gateway.nodeRegistryLogicUpdateIN3Node(req.body);
    res.json({
      status: 'success',
      message: 'IN3 node updated successfully',
      data,
    });
  } catch (e) {
    logger.error('Error in IN3 node updation', e);
    res.json({
      status: 'failure',
      message: 'IN3 node updation failed',
      data: [],
    });
  }
});

/**
 * Route that fetches all the public variables of NodeRegistryLogic contract
 */
router.get('/noderegistrylogic/all/public/state/variables', async (req, res) => {
  try {
    const data = await gateway.getNodeRegistryLogicPublicVariables(req.query);
    res.json({
      status: 'success',
      message: 'Fetched all public state variables',
      data,
    });
  } catch (e) {
    logger.error('Error in fetching all public state variables', e);
    res.json({
      status: 'failure',
      message: 'Fetching all state variables failed',
      data: [],
    });
  }
});




module.exports = router;
