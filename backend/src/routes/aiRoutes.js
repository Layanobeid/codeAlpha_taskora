// backend/src/routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { suggestTask } = require('../controllers/aiController');

router.use(protect);
router.post('/suggest-task', suggestTask);

module.exports = router;