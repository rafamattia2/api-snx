# RESTful API Project - SmartNX Technical Challenge

This project is a RESTful API developed in Node.js for managing users, posts, and comments. The API offers Create, Read, Update, and Delete (CRUD) operations with JWT authentication to protect routes. This README provides project information, including setup instructions, execution, and technologies used.

## Technologies Used

- **Node.js** with Express for endpoint creation
- **Sequelize** and **Mongoose** for database management
- **PostgreSQL** as relational database for posts and comments management
- **MongoDB** for user registration and authentication
- **JWT (JSON Web Token)** for secure authentication
- **Docker** for container creation
- **Vitest** for unit testing
- **Yup** for data validation

## Features

### Core Features

1. **User Management**: Complete user registration and authentication system
2. **Posts Management**: CRUD operations for posts
3. **Comments System**: Full comment functionality on posts
4. **JWT Authentication**: Secure route protection with JWT tokens
5. **Dual Database System**: PostgreSQL for posts/comments and MongoDB for users

### Additional Features

- **Error Handling**: Centralized error handling middleware
- **Data Validation**: DTO pattern with Yup validation
- **Pagination**: Implemented for listing resources
- **Health Check**: API status monitoring endpoint

## Prerequisites

- [Node.js](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/) and [MongoDB](https://www.mongodb.com/)
- [Docker](https://www.docker.com/)

## Setup and Execution

1. **Clone the repository**:

   ```bash
   git clone https://github.com/rafamattia2/api-snx.git
   cd api-snx
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure environment**:

   - Create `.env` file based on `.env.example`
   - Only `JWT_SECRET` needs to be set, other variables can remain as default

   ```env
   JWT_SECRET=your_secret_key_here
   ```

4. **Start the server**:

   ```bash
   npm start
   ```

5. **Run with Docker (RECOMMENDED)**:

   ```bash
   docker-compose up --build
   # or
   docker compose up --build
   ```

## API Endpoints

### Users

- `POST /users` - Register new user
- `POST /users/login` - Authenticate user and get JWT token
- `GET /users/:userId` - Get user details
- `GET /users` - List all users (paginated)
- `PUT /users/:userId` - Update user information
- `DELETE /users/:userId` - Delete user account

### Posts

- `POST /posts` - Create new post
- `GET /posts` - List all posts (paginated)
- `PUT /posts/:id` - Update post
- `DELETE /posts/:id` - Delete post

### Comments

- `POST /posts/:postId/comments` - Add comment to post
- `GET /posts/:postId/comments` - List post comments (paginated)
- `PUT /comments/:id` - Update comment
- `DELETE /comments/:id` - Delete comment

### Health Check

- `GET /health` - Check API status

## Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your-token>
```

## Testing

Unit tests are written using [Vitest](https://vitest.dev/).
To run tests:

```bash
npm test
```

Tests cover main functionalities including services and controllers.

## Error Handling

The API implements a centralized error handling system with standardized error responses:

- `400` - Bad Request (Validation errors)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Data Validation

Input validation is handled using [Yup](https://www.npmjs.com/package/yup) schema validation:

- User data validation
- Post content validation
- Comment content validation

## API Documentation

### Testing with Postman

[<img src="https://run.pstmn.io/button.svg" alt="Run In Postman" style="width: 128px; height: 32px;">](https://rafadev-4523.postman.co/workspace/2a2adf42-be63-45e9-a56e-619634f9d932/overview)

### Quick Start Guide

1. **Create a User Account**:

   - Use the `POST /users` endpoint
   - Body example:

   ```json
   {
     "name": "Test User",
     "username": "testuser",
     "password": "test123"
   }
   ```

2. **Login to Get JWT Token**:

   - Use the `POST /users/login` endpoint
   - Body example:

   ```json
   {
     "username": "testuser",
     "password": "test123"
   }
   ```

   - Copy the token from the response

3. **Set Up Environment Variable**:

   - In Postman, click on "Environment" in the left sidebar
   - Create a new environment (e.g., "API Environment")
   - Add a variable named `jwt_token`
   - Paste your JWT token in the "Current Value" field
   - Click "Save"

4. **Using Protected Routes**:
   - All protected routes will automatically use the `jwt_token` variable
   - The token is valid for 1 hour
   - If you get a 401 error, repeat step 2 to get a new token

Now you can test all other endpoints! The authorization header is automatically included in all requests using the environment variable.

> Note: Make sure to select your environment in Postman before making requests

## Code Style

We recommend using ESLint with AirBnB style. To install and configure:

```bash
npm install eslint --save-dev
npx eslint --init
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---
