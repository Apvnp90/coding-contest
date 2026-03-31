# Code Challenge - Buyer Management System

A full-stack application for managing buyer information with React frontend and Spring Boot backend.

## Project Structure

```
code-challenge/
├── code-challenge-api/     (Spring Boot Backend)
└── code-challenge-ui/      (React Frontend)
```

## Prerequisites

- Java 25
- Node.js and npm
- PostgreSQL 12 or higher
- Maven

## Database Setup

1. Install PostgreSQL if not already installed
2. Create a new database:
   ```sql
   CREATE DATABASE coding-challenge-db;
   ```
3. The default credentials in `application.properties` are:
   - Username: `postgres`
   - Password: `postgres`
   - Port: `5432`
   
   Update these in `code-challenge-api/src/main/resources/application.properties` if needed.

## Backend Setup (Spring Boot)

1. Navigate to the backend directory:
   ```bash
   cd code-challenge-api
   ```

2. Build the project:
   ```bash
   mvnw clean install
   ```

3. Run the application:
   ```bash
   mvnw spring-boot:run
   ```

The backend API will start on `http://localhost:8081`

### API Endpoints

- **POST** `/api/buyers` - Create a new buyer
  - Request Body:
    ```json
    {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com"
    }
    ```

## Frontend Setup (React)

1. Navigate to the frontend directory:
   ```bash
   cd code-challenge-ui
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The frontend will start on `http://localhost:3000`

## Features

### Add Buyer Form
- **First Name**: Required, max 30 characters, letters and spaces only
- **Last Name**: Required, max 30 characters, letters and spaces only
- **Email**: Required, valid email format

### Validation
- Client-side validation with real-time feedback
- Server-side validation with detailed error messages
- Form prevents submission with invalid data

### Technical Implementation

**Backend:**
- REST API with Spring Boot 4.0.5
- PostgreSQL database
- JPA/Hibernate for data persistence
- DTO pattern for request/response
- Global exception handling
- Bean validation

**Frontend:**
- React 18 with functional components and hooks
- React Router for navigation
- Modern responsive UI design
- Real-time form validation
- Error handling with user-friendly messages

## Testing the Application

1. Ensure PostgreSQL is running
2. Start the backend server (port 8081)
3. Start the frontend development server (port 3000)
4. Navigate to `http://localhost:3000` in your browser
5. Fill in the buyer form and submit

## Notes

- The backend runs on port 8081 to avoid conflicts with common services on port 8080
- CORS is enabled for local development
- The database schema is automatically created/updated on startup
- Logging has been omitted as per requirements
