// backend/src/controllers/aiController.js
const { suggestTask } = require('../services/openaiService');

exports.suggestTask = async (req, res) => {
  try {
    const { description } = req.body;

    if (!description || description.length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a task description (at least 5 characters)'
      });
    }

    const suggestion = await suggestTask(description);

    res.status(200).json({
      success: true,
      data: suggestion
    });
  } catch (error) {
    console.error('AI Suggestion Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate suggestion'
    });
  }
};