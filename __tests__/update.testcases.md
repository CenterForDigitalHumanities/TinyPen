# /update Endpoint Test Cases

## Expected Behaviors

### 1. PUT /update with valid object
- Should return 200
- Response: updated object

### 2. PUT /update with missing object ID
- Should return 400
- Response: error message indicating missing ID

### 3. PUT /update with malformed JSON
- Should return 400 or 500
- Response: error message, no stack trace

### 4. PUT /update with empty body
- Should return 400
- Response: error message

### 5. PUT /update with non-existent object
- Should return 404
- Response: error message indicating not found

---

Add new cases as needed. Checklist for /update route.
