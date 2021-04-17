const express = require('express');
const router = express.Router();
const filesController = require('../app/api/controllers/files');

router.post('/upload',filesController.upload);
router.get('/download/:id',filesController.download);
router.get('/userfiles/',filesController.getUserFiles);
module.exports = router;