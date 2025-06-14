# BlogAPI

# Blog App

A Node.js + Express blog platform that supports user authentication, creating, viewing, filtering, and managing blogs. Built with MongoDB and EJS templating.

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [API Routes](#api-routes)

---

## Features

- User signup and login with JWT authentication
- View latest published blogs on the homepage
- Authenticated users can create, edit, delete, and filter their own blogs
- Blog filtering by title, tags, author, and state (draft/published)
- Pagination and sorting for blog lists

---

## Installation

1. Clone the repo:
   ```bash
   git clone https://github.com/yourusername/blog-app.git
   cd blog-app
2. Install dependencies:
        npm install
3. Create a .env file in the root directory and add the following variables:
    PORT=3000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    SESSION_SECRET=your_session_secret
4. Start the App:
    npm start
5. Visit http://localhost:3000 in your browser.

## Usage

Home Page (GET /)
Displays the latest published blogs for all users (no login required).

Shows blog previews with pagination.

No filter options available here to keep it simple.

User Authentication
Signup: GET /signup and POST /signup to create a new user.

Login: GET /login and POST /login to authenticate.

After login, a JWT token is stored in cookies for session management.

Blogs Management (Authenticated Routes)
All routes below require the user to be logged in.

View My Blogs: GET /blogs

Shows all blogs by the authenticated user.

Supports filtering by state (draft/published), title, tags, and author.

Supports pagination and sorting.

Create New Blog: GET /blogs/new to show form, POST /blogs to submit a new blog.

View Single Blog: GET /blogs/:id

Edit Blog: GET /blogs/:id/edit to show edit form, PUT /blogs/:id to update.

Delete Blog: DELETE /blogs/:id

| Route             | Method   | Description                                   | Auth Required | Example Request Payload (JSON)                  |
| ----------------- | -------- | --------------------------------------------- | ------------- |-------------------------------------------------|
| `/`               | GET      | Show homepage with latest **published** blogs | No            |N/A
| `/signup`         | GET/POST | Show signup form / create a new user          | No            | `{ "first_name": "John", "last_name": "Doe", "email": "john@example.com", "password": "password123" }` |
| `/login`          | GET/POST | Show login form / authenticate user           | No            |`{ "email": "john@example.com", "password": "password123" }` |
| `/blogs`          | GET      | List authenticated user's blogs with filters  | Yes           |Query params: `?state=published&title=tech&tags=javascript,node` |
| `/blogs`          | POST     | Create a new blog post                        | Yes           |`{ "title": "My First Blog", "body": "This is the blog content", "tags": ["tech","javascript"], "state": "draft" }` |
| `/create`         | GET      | Show form to create a new blog post           | Yes           |N/A
| `/blogs/:id`      | GET      | View a specific blog post                     | Yes           |Query params:`:id`
| `/edit/:id`       | GET      | Show form to edit a blog post                 | Yes           |N/A
| `/blogs/:id`      | PUT      | Update a blog post                            | Yes           |`{ "title": "My First Blog", "body": "This is the blog content", "tags": ["tech","javascript"], "state": "draft" }` |
| `/blogs/:id`      | DELETE   | Delete a blog post                            | Yes           |N/A

## Sample Request: Update Blog
curl -X PUT http://localhost:3000/blogs/<blog_id> \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <your_jwt_token>" \
-d '{
  "title": "Updated Blog Title",
  "body": "Updated content for the blog.",
  "state": "published"
}'

## Sample Request: Login
curl -X POST http://localhost:3000/login \
-H "Content-Type: application/json" \
-d '{
  "email": "john@example.com",
  "password": "password123"
}'
## Sample Request: Create Blog
curl -X POST http://localhost:3000/create \
-H "Content-Type: application/json" \
-d {
  "title": "My New Blog",
  "body": "Content of the blog.",
  "tags": ["test", "postman"],
  "state": "draft"
}

