const express = require('express');
const router = express.Router();
const instructionController = require('../controllers/instructionController');


router.get('/:id/slides', instructionController.getSlidesByInstructionId);

router.post('/:instructionId/share-to-group', instructionController.shareInstructionToGroups);

router.get('/:id/shared-groups' , instructionController.getSharedGroups);


router.get('/groups/:groupId/instructions', instructionController.getInstructionsByGroup);

module.exports = router;
