
# [**Live Version**](https://the-alter-office-assignment.onrender.com/health)

## For detailed API documentation, check out the [**API Docs**](https://the-alter-office-assignment.onrender.com/docs).

This will make it easy for users to access both the live version of your app and the API documentation. Let me know if you'd like any further changes!
# Custom URL Shortener API

This project is a scalable and feature-rich Custom URL Shortener API designed to simplify the sharing of long URLs, track detailed analytics, and ensure security through Google Sign-In authentication. The API supports advanced features such as rate limiting, custom aliases, topic-based URL grouping, and more.


### Features

- **Google Login Authentication**: Users can authenticate via Google Sign-In.
- **Shorten URLs**: Users can shorten long URLs and optionally provide custom aliases.
- **Redirect URLs**: Redirect users to the original long URL via the shortened version.
- **Analytics**: Detailed analytics for each shortened URL, including total clicks, unique users, and device/OS statistics.
- **Topic Grouping**: Group URLs by topic for better organization (e.g., acquisition, activation).
- **Rate Limiting**: Limits the number of URL shorteners a user can generate within a given time period.
- **Caching**: Implements Redis caching for faster analytics retrieval and URL redirection.
- **Dockerized Application**: The entire application is containerized using Docker for easy deployment and scalability.
- **Swagger API Documentation**: Comprehensive API documentation is available via Swagger for easy understanding and testing of each endpoint.
- **Unit and Integration Testing with Jest**: The application includes unit and integration tests using Jest to ensure code reliability and correctness.


## Technologies Used

- **Node.js**: Backend framework.
- **Express.js**: Web framework to handle routing.
- **Redis**: In-memory data store for caching.
- **JWT**: For secure user authentication and session management.
- **Google OAuth**: For user login authentication.
- **Docker**: For containerization of the application.
- **Swagger**: For API documentation and easy testing of endpoints.
- **PostgreSQL**: Relational database for persistent data storage.
- **Jest**: Testing framework for unit and integration tests.

---


### Task Overview

This API was created as part of a task to build an **Advanced URL Shortener app** with comprehensive analytics, custom aliases, and rate limiting. The solution ensures scalability, efficient URL management, and the ability to track user engagement effectively across multiple platforms.

---

## Features Implemented Based on the Assignment

1. **User Authentication via Google Sign-In**:
   - Users can sign in using their Google accounts for a secure authentication process.

2. **Short URL Creation**:
   - Users can shorten URLs and optionally specify a custom alias. 
   - URLs can be categorized by topics such as **acquisition**, **activation**, and **retention**.

3. **Redirect Short URLs**:
   - Short URLs redirect users to the original URL with automatic tracking of analytics like clicks, device type, and OS.

4. **Analytics APIs**:
   - Retrieve detailed analytics for individual URLs, grouped by topic, or overall statistics across all created links.
   - Analytics track information like clicks, user demographics (device/OS), and interactions over time.

5. **Rate Limiting**:
   - Rate limiting is implemented to prevent users from overusing the URL shortening service within short periods.

6. **Redis Caching**:
   - Redis is used to cache frequently accessed data, such as analytics for URLs, reducing database load and improving response times.

7. **Dockerized Solution**:
   - The application is containerized using Docker to ensure portability and scalability.
   - Deployment on a cloud hosting service (e.g., AWS, Heroku) for easy access and high availability.

8. **API Documentation**:
   - Comprehensive API documentation using Swagger for easy understanding of each endpoint and its functionality.

---

## Installation and Running the Project

1. Clone the repository:
   ```bash
   git clone https://github.com/adxxtya/the-alter-office-assignment.git short-url-api
   cd short-url-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the environment variables:
   - Create a `.env` file in the root of the project and configure the following variables:
     ```bash
     DATABASE_URL=your-database-connection-url
     DIRECT_URL=your-direct-database-connection-url
     REDIS_URL=your-redis-url
     GOOGLE_CLIENT_ID=your-google-client-id
     GOOGLE_CLIENT_SECRET=your-google-client-secret
     JWT_SECRET=your-jwt-secret
     ```

4. Run Prisma migrations to set up the database schema:
   ```bash
   npx prisma migrate dev
   ```

5. Build and run the Docker container:
   ```bash
   docker-compose up --build
   ```

6. The application will be available on `http://localhost:3000`.

---

## Deployment

This project is dockerized and deployed to a cloud hosting service for scalability and easy access. A live version of the application can be accessed via the following link:

**[Live Version](your-deployment-url)**

---

## Challenges Faced and Solutions Implemented

- **Challenge: Rate Limiting Implementation**  
  Ensuring that users could not abuse the shortening feature within short time spans.  
  **Solution**: Implemented rate limiting using a time-based key-value store (Redis) to track the number of URLs created by each user within a time window.

- **Challenge: Google Sign-In Integration**  
  Integrating Google OAuth for secure user login while ensuring that user data is properly stored and retrieved from the database.  
  **Solution**: Implemented `google-login` authentication flow using the Google API, handling user creation in the database and session management via JWT.

- **Challenge: Caching with Redis**  
  Ensuring that the application performs well under heavy traffic while managing the analytics of numerous short URLs.  
  **Solution**: Used Redis to cache frequently requested data, including analytics and URL lookups, to improve performance and reduce load on the primary database.


