// server.js
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import swaggerUiDist from 'swagger-ui-dist';

// Get the directory name using ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file in development
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const app = express();
const PORT = process.env.PORT || 3000;

// Determine the server URL based on environment
const isProd = process.env.NODE_ENV === 'production';
const serverUrl = isProd 
  ? 'https://generate-users-svc.vercel.app' 
  : `http://localhost:${PORT}`;

// Load and modify Swagger document
const swaggerPath = path.join(__dirname, 'swagger.yaml');
let swaggerContent = fs.readFileSync(swaggerPath, 'utf8');

// Create a modified Swagger document with the correct server URL
const swaggerDocument = YAML.parse(swaggerContent);

// Set the servers dynamically based on environment
swaggerDocument.servers = [
  {
    url: serverUrl,
    description: isProd ? 'Production server' : 'Local development server'
  }
];

// Middlewares
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'", "unpkg.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "unpkg.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "unpkg.com"],
      imgSrc: ["'self'", "data:", "https://cloudflare-ipfs.com/", "unpkg.com"]
    }
  }
}));
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

// Get the path to swagger-ui-dist
const swaggerUiDistPath = swaggerUiDist.getAbsoluteFSPath();

// Explicitly serve static files from swagger-ui-dist
app.use('/swagger-ui.css', express.static(path.join(swaggerUiDistPath, 'swagger-ui.css')));
app.use('/swagger-ui-bundle.js', express.static(path.join(swaggerUiDistPath, 'swagger-ui-bundle.js')));
app.use('/swagger-ui-standalone-preset.js', express.static(path.join(swaggerUiDistPath, 'swagger-ui-standalone-preset.js')));
app.use('/favicon-32x32.png', express.static(path.join(swaggerUiDistPath, 'favicon-32x32.png')));
app.use('/favicon-16x16.png', express.static(path.join(swaggerUiDistPath, 'favicon-16x16.png')));

// Serve Swagger UI static files
app.use(express.static(swaggerUiDistPath));

// Create a custom HTML for Swagger UI
app.get('/', (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>User Generation Service API</title>
      <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.0.0/swagger-ui.css">
      <style>
        html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
        *, *:before, *:after { box-sizing: inherit; }
        body { margin: 0; background: #fafafa; }
      </style>
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist@5.0.0/swagger-ui-bundle.js"></script>
      <script src="https://unpkg.com/swagger-ui-dist@5.0.0/swagger-ui-standalone-preset.js"></script>
      <script>
        window.onload = function() {
          const ui = SwaggerUIBundle({
            url: "${serverUrl}/swagger.yaml",
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [
              SwaggerUIBundle.presets.apis,
              SwaggerUIStandalonePreset
            ],
            plugins: [
              SwaggerUIBundle.plugins.DownloadUrl
            ],
            layout: "StandaloneLayout"
          });
          window.ui = ui;
        };
      </script>
    </body>
    </html>
  `;

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

// Serve the swagger.yaml file
app.get('/swagger.yaml', (req, res) => {
  res.setHeader('Content-Type', 'text/yaml');
  res.sendFile(path.join(__dirname, 'swagger.yaml'));
});

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

// Health check endpoint
app.get('/health', (req, res) => {
  const uptime = process.uptime();
  const uptimeFormatted = formatUptime(uptime);
  
  res.json({
    status: 'ok',
    uptime: uptimeFormatted,
    timestamp: new Date().toISOString()
  });
});

// Helper function to format uptime
function formatUptime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${hours}h ${minutes}m ${secs}s`;
}

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
  console.log(`Swagger UI available at: ${serverUrl}`);
});
