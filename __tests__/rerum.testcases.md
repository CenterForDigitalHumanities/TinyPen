# RERUM Fetch Timeout and Upstream Failure Test Cases

This file documents test cases for TinyPen's outgoing RERUM fetch behavior. These are not executable tests, but serve as a checklist for future test harness development.

## Expected Behaviors

### 1. RERUM responds quickly (normal success path)

- Setup: RERUM returns a valid 2xx JSON response before timeout
- Should return expected route success code (200/201/204)
- Response: pass-through body or headers expected by route

### 2. RERUM accepts connection but never responds

- Setup: upstream socket stays open with no response body/status
- Should abort request after configured timeout
- Should return 504
- Response: timeout message indicating RERUM did not respond in time

### 3. RERUM response arrives just before timeout threshold

- Setup: upstream responds slightly before timeout deadline
- Should not abort request
- Should return route success code and expected body

### 4. RERUM network failure before response (DNS/connect/reset)

- Setup: fetch fails with connection-level/network error
- Should return 502
- Response: generic upstream error message

### 5. RERUM returns non-2xx status with text body

- Setup: upstream returns 4xx/5xx and text payload
- Should return 502 from TinyPen routes
- Response: includes upstream status and text body when available

### 6. RERUM returns non-2xx status with unreadable/invalid body

- Setup: upstream returns error status, body read fails
- Should return 502
- Response: generic upstream error message

### 7. RERUM returns 2xx with invalid payload shape for create/update/overwrite

- Setup: upstream returns 200 but missing `id` and `@id`
- Should return 502
- Response: generic upstream error message

### 8. /overwrite conflict pass-through remains intact

- Setup: upstream returns 409 with JSON conflict body
- Should return 409
- Response: conflict JSON body from upstream

### 9. Timeout value is overridden by environment variable

- Setup: set `RERUM_FETCH_TIMEOUT_MS` to a small positive value
- Should abort according to that configured value
- Should return 504 on stalled upstream

### 10. Invalid timeout env value falls back to default

- Setup: set `RERUM_FETCH_TIMEOUT_MS` to empty, non-numeric, or <= 0
- Should use default timeout value
- Should still abort stalled requests and return 504

---

Add new cases as needed. Checklist for RERUM timeout and upstream resiliency behavior.
