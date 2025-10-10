const mongoose = require('mongoose');

// Defines the structure for a single quiz question document
const QuestionSchema = new mongoose.Schema({
  // The question text itself
  question: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
  },
  // An array of possible answers
  options: {
    type: [String], // Array of strings
    required: [true, 'Options are required'],
    validate: {
      validator: (arr) => arr.length >= 2,
      message: 'A question must have at least two options',
    },
  },
  // The index (position) of the correct answer in the 'options' array
  // Example: if options = ["A", "B", "C"] and correctOptionIndex = 1, then "B" is correct.
  correctOptionIndex: {
    type: Number,
    required: [true, 'Correct option index is required'],
    min: 0,
  },
  // Optional: category for filtering quizzes
  category: {
    type: String,
    default: 'General',
  },
}, { timestamps: true });

module.exports = mongoose.model('Question', QuestionSchema);
