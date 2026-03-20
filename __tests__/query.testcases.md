# Query Route Test Cases

This file documents the test cases for the /query endpoint. These are not executable tests, but serve as a checklist for future test harness development.

## Expected Behaviors

### 1. POST /query with body {}
- Should return 200
- Response: empty result set (e.g., [])

### 2. POST /query with body []
- Should return 400
- Response: error message indicating invalid query shape

### 3. POST /query with body null
- Should return 400
- Response: error message indicating invalid query

### 4. POST /query with body ""
- Should return 400
- Response: error message indicating invalid query

### 5. POST /query with body 0
- Should return 400
- Response: error message indicating invalid query

### 6. POST /query with body true
- Should return 400
- Response: error message indicating invalid query

### 7. POST /query with valid query object
- Should return 200
- Response: result set matching query

### 8. POST /query with malformed JSON (e.g., {broken json)
- Should return 400 or 500
- Response: error message, no stack trace

### 9. POST /query with missing limit/skip
- Should default to limit=10, skip=0
- Should return 200

### 10. POST /query with negative limit/skip
- Should return 400
- Response: error message indicating invalid parameters

---

Add new cases as needed. This file is for planning and tracking test coverage for /query route.
