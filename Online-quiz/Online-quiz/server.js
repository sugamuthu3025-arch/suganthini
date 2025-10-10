const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const quizRoutes = require('./routes/quizRoutes');
const path = require('path'); // Import the path module

// Load environment variables from config/.env
dotenv.config({ path: './config/.env' });

// Initialize App
const app = express();

// Middleware
app.use(express.json());

// --- FRONTEND SERVING ---
// 1. Serve static files (HTML, CSS, JS) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// 2. Fallback route: Serve index.html for the root path (/)
// This ensures that when someone visits http://localhost:5000/, they get the quiz page.
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
// --- END FRONTEND SERVING ---


// API Routes
app.use('/api/quizzes', quizRoutes);

// Database Connection
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("--- FATAL ERROR ---");
    console.error("MONGO_URI is not defined in the environment variables.");
    console.error("Please ensure you have a .env file in the config/ directory and it contains MONGO_URI=your_connection_string");
    process.exit(1);
}

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected successfully.'))
    .catch(err => console.error('MongoDB connection error:', err));


// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}. Frontend available at http://localhost:${PORT}`));
