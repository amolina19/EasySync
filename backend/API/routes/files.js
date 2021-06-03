const express = require('express');
const router = express.Router();
const filesController = require('../app/api/controllers/files');

router.post('/storage/upload',filesController.upload);
router.post('/storage/rename',filesController.renameFile);
router.post('/storage/delete',filesController.removeFile);
router.post('/storage/createfolder',filesController.createFolder);
router.post('/storage/move',filesController.move);
router.post('/storage/trash',filesController.trash);
router.get('/storage/download',filesController.download);
router.get('/userfiles/',filesController.getUserFiles);
router.get('/storagesize',filesController.getUserSizeStorage);

router.post('/download/',filesController.getFileToDownload);
router.get('/download/',filesController.downloadURL);

router.post('/storage/geturlfile/',filesController.setPublicDownload);
router.post('/storage/getpublicpassword/',filesController.getPublicFilePassword);
router.post('/storage/deleteurl/',filesController.deleteURL);

//ADMIN
router.post('/storage/remove/all',filesController.removeAllFiles);

module.exports = router;