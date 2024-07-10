Organisation Management System
Welcome to the Organisation Management System! This project is designed to manage user registrations, logins, and organisation management tasks, including creating organisations and adding users to them. The backend is built with Node.js, Express.js, Sequelize, and JWT for authentication.

Table of Contents
Features
Technologies Used
Setup and Installation
API Endpoints
Usage
Contributing
License
Features
User Registration and Login
JWT-based Authentication
Organisation Creation and Management
Fetching Organisations for Logged-in Users
Adding Users to Organisations
Protected Routes
Technologies Used
Backend: Node.js, Express.js
Database: PostgreSQL, Sequelize ORM
Authentication: JSON Web Token (JWT)
Validation: express-validator
Encryption: bcryptjs

Setup and Installation
Clone the Repository

git clone https://github.com/gurumarv/organisation-management-system.git
cd organisation-management-system

Install Dependencies

npm install
Set Up Environment Variables

Create a .env file in the root directory and add the following environment variables:

makefile
Copy code
PORT=8080
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
Run the Application

sh
Copy code
npm start
The server should be running on http://localhost:8080.

API Endpoints
Authentication Routes
Register User

http
Copy code
POST /auth/register
Request Body:

json
Copy code
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "yourpassword",
  "phone": "1234567890"
}
Login User

http
Copy code
POST /auth/login
Request Body:

json
Copy code
{
  "email": "john.doe@example.com",
  "password": "yourpassword"
}
Organisation Routes
Get Organisations for Logged-in User

http
Copy code
GET /api/my-organisations
Get All Organisations

http
Copy code
GET /api/organisations
Create Organisation

http
Copy code
POST /api/organisations
Request Body:

json
Copy code
{
  "name": "My Organisation",
  "description": "Description of the organisation"
}
Get Organisation by ID

http
Copy code
GET /api/organisations/:orgId
Add User to Organisation

http
Copy code
POST /api/organisations/:orgId/users
Request Body:

json
Copy code
{
  "userId": "user_id_to_add"
}
Usage
Register a New User: Use the /auth/register endpoint to create a new user account.
Login User: Use the /auth/login endpoint to log in and obtain a JWT token.
Create Organisation: Use the /api/organisations endpoint to create a new organisation.
Fetch Organisations: Use the /api/my-organisations and /api/organisations endpoints to fetch organisations associated with the logged-in user.
Add User to Organisation: Use the /api/organisations/:orgId/users endpoint to add users to an organisation.
Contributing
Contributions are welcome! Please fork the repository and create a pull request with your changes. Ensure your code follows the project's coding standards and includes appropriate tests.

License
This project is licensed under the MIT License. See the LICENSE file for more information.
