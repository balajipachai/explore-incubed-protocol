const express = require('express');

const router = express.Router();

const gateway = require('../controller/');
const logger = require('../config/winston');

router.get('/in3/node/info', async (req, res) => {
  try {
    const data = await gateway.nodeRegistryDataGetIN3NodeInfo(req.query);
    res.json({
      status: 'success',
      message: 'Admin updated logic successfully',
      data,
    });
  } catch (e) {
    logger.error('Error in fetching in3 node information', e);
    res.json({
      status: 'failure',
      message: 'Fetching IN3 node info failed',
      data: [],
    });
  }
});
module.exports = router;