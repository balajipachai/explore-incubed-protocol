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


module.exports = router;
