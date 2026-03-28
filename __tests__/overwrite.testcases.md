# /overwrite Endpoint Test Cases

## Expected Behaviors

### 1. PUT /overwrite with valid object and version
- Should return 200
- Response: overwritten object

### 2. PUT /overwrite with missing version
- Should return 400
- Response: error message indicating missing version

### 3. PUT /overwrite with version mismatch
- Should return 409
- Response: error message indicating conflict

### 4. PUT /overwrite with malformed JSON
- Should return 400 or 500
- Response: error message, no stack trace

### 5. PUT /overwrite with empty body
- Should return 400
- Response: error message

---

Add new cases as needed. Checklist for /overwrite route.
