const express = require('express');
const router = express.Router();
const userController = require('../app/api/controllers/users');

router.post('/auth/register',userController.register);
router.post('/auth/login',userController.login);
router.post('/auth/token',userController.token);
router.post('/auth/recover_password',userController.recover_password);
router.post('/auth/send_recover_password',userController.send_recover_password);
router.post('/auth/change_password',userController.change_password);
router.post('/recover',userController.recover);
router.post('/auth/t2a/login',userController.T2A_Login);
router.post('/updatet2a',userController.update_T2A);
router.post('/auth/update_email',userController.update_email);
router.post('/delete',userController.delete);
router.post('/sessions',userController.getUserSessions);

router.post('/activate',userController.activate);

router.delete('/delete/:id',userController.delete);

module.exports = router;