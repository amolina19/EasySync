const express = require('express');
const router = express.Router();
const filesController = require('../app/api/controllers/files');

router.post('/storage/upload',filesController.upload);
router.post('/storage/rename',filesController.renameFile);
router.post('/storage/delete',filesController.removeFile);
router.post('/storage/createfolder',filesController.createFolder);
router.get('/storage/download',filesController.downloadByUrl);
router.get('/userfiles/',filesController.getUserFiles);
router.get('/storagesize',filesController.getUserSizeStorage);
module.exports = router;