const express = require('express');
const router = express.Router();
const filesController = require('../app/api/controllers/files');

router.post('/upload',filesController.upload);
router.get('/download',filesController.downloadByUrl);
router.get('/userfiles/',filesController.getUserFiles);
router.get('/storagesize',filesController.getUserSizeStorage);
module.exports = router;