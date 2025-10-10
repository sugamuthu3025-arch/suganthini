1. Get an Admin Token (Required for CRUD)
Since the administration routes are protected by the protect middleware, you first need a valid JSON Web Token (JWT). The API has a testing route for this:

Step	Method	Endpoint	Note
Get Token	GET	http://localhost:5000/api/quizzes/admin/token	Run this once to get the token value.

Export to Sheets
Action: Copy the token value from the response.

When testing the Add a Question route (POST /api/quizzes/admin/questions), the body of the request must be pure JSON.

Please double-check the following in your API testing tool:

Method and URL: Ensure the method is POST and the URL is http://localhost:5000/api/quizzes/admin/questions.

Headers: Ensure you have the Authorization header set to Bearer <YOUR_ADMIN_TOKEN>.

Body Format: You must select the "raw" body type and set the content type to "JSON (application/json)".

Content: The content in the body panel must be correctly formatted JSON, enclosed in curly braces {}.

Use the following example structure for the request body:

JSON

{
  "question": "What is the largest planet in our solar system?",
  "options": ["Mars", "Jupiter", "Earth", "Saturn"],
  "correctOptionIndex": 1,
  "category": "Science"
}
If you accidentally pasted the URL or surrounding text like this into the body, it would cause the error:

POST http://localhost:5000/api/quizzes/admin/questions { ... }
The server only expects the content inside the curly braces. Correcting your request body should solve the problem immediately!