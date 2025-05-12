const express = require('express');
const router = express.Router();
const instructionController = require('../controllers/instructionController');
const upload = require('../middleware/upload');
const middleware = require('../middleware/auth');

router.get('/:id/slides', instructionController.getSlidesByInstructionId);

router.post('/:instructionId/share-to-group', instructionController.shareInstructionToGroups);

router.get('/:id/shared-groups' , instructionController.getSharedGroups);


router.get('/groups/:groupId/instructions', instructionController.getInstructionsByGroup);

router.delete('/:id/unshare-group/:groupId', instructionController.unshareGroupFromInstruction);

// PUT /api/instructions/:id


// DELETE /api/instructions/:id
router.delete('/:id', instructionController.deleteInstruction);

 
router.get('/:id/with-pages', instructionController.getInstructionWithPages);

router.put(
    '/:id/with-pages',
    upload.fields([
      { name: 'image_0' }, { name: 'video_0' }, { name: 'audio_0' },
      { name: 'image_1' }, { name: 'video_1' }, { name: 'audio_1' },
      { name: 'image_2' }, { name: 'video_2' }, { name: 'audio_2' },
      // ⚠️ Дээд тал нь хэдэн хуудсыг дэмжихээ энд нэмээрэй
    ]),
    instructionController.updateInstructionWithPages
  );


  // Handle multiple files per page using fields
const fields = [
    { name: 'image_url_0' }, { name: 'audio_url_0' }, { name: 'video_url_0' },
    { name: 'image_url_1' }, { name: 'audio_url_1' }, { name: 'video_url_1' },
    { name: 'image_url_2' }, { name: 'audio_url_2' }, { name: 'video_url_2' },
    // нэмэх шаардлагатай бол динамикжуулж болно
  ];
  
  router.put('/:id/with-media', upload.fields(fields), instructionController.updateInstructionWithMedia);
  
  // 📋 Өдөр сонгож түүхүүдийг авах
router.get('/history', middleware , instructionController.getInstructionHistoriesByDate);



// 📜 Нэг түүх дэлгэрэнгүй авах
router.get('/history/:id', instructionController.getInstructionHistoryDetail);

module.exports = router;
