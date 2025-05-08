const express = require('express');
const router = express.Router();
const instructionController = require('../controllers/instructionController');
const upload = require('../middleware/upload');


router.get('/:id/slides', instructionController.getSlidesByInstructionId);

router.post('/:instructionId/share-to-group', instructionController.shareInstructionToGroups);

router.get('/:id/shared-groups' , instructionController.getSharedGroups);


router.get('/groups/:groupId/instructions', instructionController.getInstructionsByGroup);

router.delete('/:id/unshare-group/:groupId', instructionController.unshareGroupFromInstruction);

// PUT /api/instructions/:id
router.put('/:id', instructionController.updateInstruction);

// DELETE /api/instructions/:id
router.delete('/:id', instructionController.deleteInstruction);

 
router.get('/:id/with-pages', instructionController.getInstructionWithPages);
//хуудас үүсгэх 
router.post('/instruction-pages', instructionController.createPage);

//хуудас засах

// routes/instruction.js
router.delete('/instruction-pages/:id', instructionController.deletePage);


router.post('/:id/instruction-pages', upload.single('file'), instructionController.addInstructionPage);

module.exports = router;
