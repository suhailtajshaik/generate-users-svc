# User Generation Service

A simple Express.js API service that generates random user data with department assignments.

## Description

This service provides an API endpoint that generates a specified number of random users with realistic names, avatars, and department assignments. It's built with Express.js and uses Faker.js to generate realistic user data.

## Features

- Generate random users with names, avatars, and department assignments
- Configurable number of users to generate
- Security features including Helmet, rate limiting, and compression
- Environment variable configuration
- Error handling and logging

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/suhailtajshaik/generate-users-svc.git
   cd generate-users-svc
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   NODE_ENV=development
   ```

## Usage

### Starting the server

Development mode:
```
npm run dev
```

Production mode:
```
npm start
```

### API Documentation

The API is documented using Swagger/OpenAPI. When you access the root URL of the deployed application, you'll see the interactive Swagger UI documentation.

The Swagger UI automatically detects your environment:
- In production: [https://generate-users-svc.vercel.app/](https://generate-users-svc.vercel.app/)
- In development: [http://localhost:3000/](http://localhost:3000/)

The Swagger UI allows you to:
- Read detailed API documentation
- Test API endpoints directly from your browser
- See request/response schemas and examples

#### Generate Random Users

```
GET /api/users/:count
```

Generates a specified number of random users with names, avatars, and department assignments.

**URL Parameters:**
- `count` (required): Number of users to generate (must be a positive integer)

**Response Format:** JSON array of user objects

**Example Request:**
```
GET /api/users/5
```

**Example Response:**
```json
[
  {
    "name": "John Doe",
    "avatar": "https://cloudflare-ipfs.com/ipfs/Qmd3W5DuhgHirLHGVixi6V76LhCkZUz6pnFt5AJBiyvHye/avatar/1234.jpg",
    "departments": ["Hardware", "Electrical"],
    "userId": "123e4567-e89b-12d3-a456-426614174000"
  },
  {
    "name": "Jane Smith",
    "avatar": "https://cloudflare-ipfs.com/ipfs/Qmd3W5DuhgHirLHGVixi6V76LhCkZUz6pnFt5AJBiyvHye/avatar/5678.jpg",
    "departments": ["Paint"],
    "userId": "223e4567-e89b-12d3-a456-426614174001"
  }
]
```

**Department List:**
Users are randomly assigned 1-3 departments from the following list:
- Hardware
- Plumbing
- Flooring
- Paint
- Millwork
- Building Material
- Electrical
- Home Decor
- Inside Lawn & Garden
- Outside Lawn & Garden
- Appliances
- Cabinets
- Pro Department

**Status Codes:**
- `200 OK`: Successfully generated users
- `400 Bad Request`: Invalid count parameter (must be a positive integer)
- `404 Not Found`: Endpoint not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

### Rate Limiting

The API implements rate limiting to prevent abuse. Clients are limited to:
- 100 requests per 15-minute window
- IP-based rate limiting

When the rate limit is exceeded, the API will respond with a 429 status code and the message: "Too many requests from this IP, please try again later."

### CORS Support

This API includes CORS (Cross-Origin Resource Sharing) support, allowing it to be accessed from web applications hosted on different domains. All origins are allowed to access the API, making it suitable for use in any frontend application.

## Dependencies

- express - Web framework
- helmet - Security middleware
- morgan - HTTP request logger
- compression - Response compression
- express-rate-limit - Rate limiting
- @faker-js/faker - Fake data generation
- dotenv - Environment variable management

## Development Dependencies

- nodemon - Development server with auto-reload

## License

ISC

## Deployment

This service can be deployed to Vercel with minimal configuration:

1. Fork or clone this repository
2. Deploy to Vercel using the Vercel CLI or GitHub integration
3. Set required environment variables in the Vercel dashboard

### Environment Variables for Production

- `NODE_ENV`: Set to "production"
- `PORT`: Automatically set by Vercel (you don't need to configure this)

### Deployment URL

Once deployed, your service will be available at:
`https://generate-users-svc.vercel.app/api/users/:count`