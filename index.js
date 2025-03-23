// server.js
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(helmet());
app.use(compression());
app.use(express.json());

// Logging (only in development, for example)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate Limiter: Limit each IP to 100 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Department list
const departments = [
  "Hardware",
  "Plumbing",
  "Flooring",
  "Paint",
  "Millwork",
  "Building Material",
  "Electrical",
  "Home Decor",
  "Inside Lawn & Garden",
  "Outside Lawn & Garden",
  "Appliances",
  "Cabinets",
  "Pro Department",
];

// Helper function: returns a random integer between min and max (inclusive)
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper function: selects random departments (1 to 3) from the list
function getRandomDepartments(deptList) {
  const count = getRandomInt(1, 3);
  // Shuffle a copy of the deptList
  const shuffled = [...deptList].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// Generate an array of users with random departments
function generateUsers(numUsers, deptList) {
  const users = [];
  for (let i = 1; i <= numUsers; i++) {
    users.push({
      name: faker.person.fullName(),
      avatar: faker.image.avatar(),
      departments: getRandomDepartments(deptList),
      userId: faker.string.uuid(),
    });
  }
  return users;
}

// API endpoint: /api/users/:count
app.get('/api/users/:count', (req, res, next) => {
  try {
    const count = parseInt(req.params.count, 10);
  
    // Validate that count is a positive number
    if (isNaN(count) || count < 1) {
      return res.status(400).json({ error: 'Invalid count. Please provide a positive integer.' });
    }
  
    const users = generateUsers(count, departments);
    res.json(users);
  } catch (error) {
    // Pass errors to the error handling middleware
    next(error);
  }
});

// Catch-all for unknown routes (404)
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Internal server error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
