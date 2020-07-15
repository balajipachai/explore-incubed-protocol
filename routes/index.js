const express = require('express');

const router = express.Router();

/**
 * Route that adds the Punch tool details into the database
 */
router.get('/', (req, res) => {
  res.json({ title: 'Blockchains/Slock.it | Assignment' });
});


module.exports = router;
