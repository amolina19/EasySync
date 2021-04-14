const express = require('express');
const router = express.Router();
const userController = require('../app/api/controllers/users');

router.post('/auth/register',userController.register);
router.post('/auth/login',userController.login);
router.delete('/delete/:id',userController.delete);
router.post('/recover',userController.recover);
router.post('/activate',userController.activate);
router.post('/auth/token',userController.token);
module.exports = router;