const express = require('express');
const router = express.Router();
const dynamicController = require('../controllers/dynamicController');

router.post('/insert', dynamicController.insert);
router.get('/:id', dynamicController.select);
router.put('/:id', dynamicController.update);
router.delete('/:id', dynamicController.del);

module.exports = router;
