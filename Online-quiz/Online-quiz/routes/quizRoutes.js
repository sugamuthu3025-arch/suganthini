const express = require('express');
const Question = require('../models/Question');
const protect = require('../middleware/protect');
const jwt = require('jsonwebtoken');

const router = express.Router();

// --- PUBLIC ROUTES (Quiz functionality) ---

// GET /api/quizzes
// Fetches a random set of questions, hiding the correct answer index.
router.get('/', async (req, res) => {
  try {
    // Fetch a random sample of 10 questions (you can adjust the limit)
    const questions = await Question.aggregate([
      { $sample: { size: 10 } }
    ]);

    // Format the questions for the client: hide the correct answer index
    const quizQuestions = questions.map(q => ({
      _id: q._id,
      question: q.question,
      options: q.options,
      category: q.category,
    }));

    res.json(quizQuestions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching quiz questions', error: error.message });
  }
});

// POST /api/quizzes/submit
// Receives user answers, checks correctness, and returns the score.
router.post('/submit', async (req, res) => {
  // req.body should be an array of objects: [{ questionId: '...', selectedIndex: N }, ...]
  const userAnswers = req.body;

  if (!Array.isArray(userAnswers)) {
    return res.status(400).json({ message: 'Invalid submission format. Expected an array of answers.' });
  }

  try {
    const questionIds = userAnswers.map(a => a.questionId);

    // Fetch the correct questions and answers from the database
    const correctQuestions = await Question.find({ 
      _id: { $in: questionIds } 
    }).select('correctOptionIndex');

    let score = 0;
    let results = [];

    // Map correct answers for quick lookup
    const correctMap = new Map(correctQuestions.map(q => [q._id.toString(), q.correctOptionIndex]));

    // Check each submitted answer
    userAnswers.forEach(answer => {
      const correctIndex = correctMap.get(answer.questionId);
      const isCorrect = (correctIndex !== undefined && correctIndex === answer.selectedIndex);

      if (isCorrect) {
        score++;
      }

      results.push({
        questionId: answer.questionId,
        submittedIndex: answer.selectedIndex,
        isCorrect: isCorrect,
        correctIndex: correctIndex,
      });
    });

    res.json({
      score: score,
      totalQuestions: correctQuestions.length,
      percentage: (score / correctQuestions.length) * 100,
      results: results, // Detailed feedback
    });

  } catch (error) {
    res.status(500).json({ message: 'Error processing quiz submission', error: error.message });
  }
});


// --- ADMIN ROUTES (CRUD operations for managing questions) ---

// Helper function to generate a temporary token for easy testing
router.get('/admin/token', (req, res) => {
    // Generate a test token that will pass the middleware
    const testToken = jwt.sign({ id: 'test_admin_user_id' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ 
        message: 'Use this token in the Authorization: Bearer header for admin routes.', 
        token: testToken,
        note: 'In a real application, this would only be generated after a successful admin login.'
    });
});


// POST /api/quizzes/admin/questions (Protected)
// Add a new question
router.post('/admin/questions', protect, async (req, res) => {
  try {
    const question = await Question.create(req.body);
    res.status(201).json({ message: 'Question added successfully', question });
  } catch (error) {
    res.status(400).json({ message: 'Failed to add question', error: error.message });
  }
});

// PUT /api/quizzes/admin/questions/:id (Protected)
// Update an existing question
router.put('/admin/questions/:id', protect, async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json({ message: 'Question updated successfully', question });
  } catch (error) {
    res.status(400).json({ message: 'Failed to update question', error: error.message });
  }
});

// DELETE /api/quizzes/admin/questions/:id (Protected)
// Delete a question
router.delete('/admin/questions/:id', protect, async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete question', error: error.message });
  }
});

module.exports = router;
