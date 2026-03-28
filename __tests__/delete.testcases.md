# /delete Endpoint Test Cases

## Expected Behaviors

### 1. DELETE /delete with valid object ID (body)
- Should return 204
- Response: no content

### 2. DELETE /delete/:id with valid object ID (param)
- Should return 204
- Response: no content

### 3. DELETE /delete with missing object ID
- Should return 400
- Response: error message indicating missing ID

### 4. DELETE /delete with malformed JSON
- Should return 400 or 500
- Response: error message, no stack trace

### 5. DELETE /delete with empty body
- Should return 400
- Response: error message

### 6. DELETE /delete/:id with non-existent object
- Should return 404
- Response: error message indicating not found

---

Add new cases as needed. Checklist for /delete route.
