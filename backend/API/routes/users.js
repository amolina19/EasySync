const express = require('express');
const router = express.Router();
const userController = require('../app/api/controllers/users');

router.post('/register',userController.create);
router.post('/authenticate',userController.authenticate);
router.delete('/delete/:id',userController.delete);
router.post('/recover',userController.recover);
router.post('/activate',userController.activate);
module.exports = router;