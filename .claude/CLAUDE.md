# CLAUDE.md

This file provides guidance to AI Assistants when working with code in this repository.

## Project Overview

**TinyPen** is a Node.js middleware/proxy application that provides secure, authenticated access to the RERUM API (a versioned object store). It acts as an intermediary that protects RERUM access tokens from client-side exposure and can operate in two modes:

1. **Client Application Mode**: A standalone app with its own front-end
2. **Centralized Client API Mode**: A public API that multiple applications can use to interact with RERUM without individual registration

This application is part of the TPEN 3.0 ecosystem for transcription and paleography education and research.

## Technology Stack

- **Runtime**: Node.js v22 with ES Modules
- **Framework**: Express.js v4.21.2
- **Language**: JavaScript (ES6+)
- **Testing**: Jest v29.7.0 with Supertest v6.3.3
- **Process Manager**: PM2 (production)
- **Key Dependencies**: cors, dotenv, envfile, http-errors

## Architecture and Design Patterns

### Primary Pattern: Proxy/Gateway
TinyPen implements an API Gateway pattern, sitting between clients and the RERUM API. It:
- Handles authentication by injecting JWT tokens
- Forwards requests to RERUM
- Relays responses back to clients
- Never exposes tokens to the client side

### Key Architectural Characteristics
- **RESTful API design** with clear resource-based endpoints
- **Stateless operation** relying on JWT tokens
- **Automatic token refresh** - proactive renewal before expiration
- **Dual-mode CORS** - configurable for single app or public API use
- **Legacy route support** - maintains `/app/*` routes for backward compatibility
- **Optimistic locking** - supports concurrent update conflict detection

## Codebase Structure

```
/mnt/e/tinyPen/
├── bin/
│   ├── tinyPen.js        # Main server entry point (production)
│   └── testApp.js        # Test runner with server instance
├── routes/
│   ├── create.js         # POST - Create new RERUM objects
│   ├── query.js          # POST - Query objects (with pagination)
│   ├── update.js         # PUT - Update objects (new version)
│   ├── overwrite.js      # PUT - Overwrite with optimistic locking
│   ├── delete.js         # DELETE - Remove objects
│   └── index.js          # Root route (returns 404)
├── __tests__/
│   └── mount.test.js     # Route registration tests
├── app.js                # Express application configuration
├── tokens.js             # JWT token management and refresh
└── package.json          # Project metadata and dependencies
```

## Key Components

### app.js (127 lines)
Main Express application setup. Key responsibilities:
- CORS configuration with origin validation
- Route registration for both `/` and `/app/` prefixes
- Middleware setup (JSON parsing, static files)
- Error handling

**Important**: Routes are registered twice - once at root and once under `/app/` for legacy support.

### tokens.js (58 lines)
JWT token lifecycle management:
- Checks token expiration by parsing JWT payload
- Automatically refreshes tokens before expiration
- Persists new tokens to `.env` file
- Runs on application startup

**Note**: This module uses the `envfile` package to rewrite the `.env` file when tokens are refreshed.

### Route Handlers
All routes follow a consistent pattern:
1. Extract request body/params
2. Add `Authorization: Bearer ${ACCESS_TOKEN}` header
3. Forward request to RERUM API using `fetch`
4. Relay response back to client
5. Handle errors with appropriate status codes

**Special Cases**:
- `/query` - Supports `?limit=N&skip=N` query parameters for pagination
- `/overwrite` - Implements optimistic locking via `If-Overwritten-Version` header
- `/delete` - Supports both body-based and param-based deletion

## API Endpoints

### Modern Routes (Preferred)
```
POST   /create        - Create new RERUM object
POST   /query         - Query objects (supports ?limit=N&skip=N)
PUT    /update        - Update existing object (creates new version)
PUT    /overwrite     - Overwrite object (with optimistic locking)
DELETE /delete        - Delete object (body-based)
DELETE /delete/:id    - Delete object (param-based)
```

### Legacy Routes (Backward Compatibility)
All modern routes also available under `/app/` prefix:
```
POST   /app/create
POST   /app/query
PUT    /app/update
PUT    /app/overwrite
DELETE /app/delete
```

**Status Codes**:
- 200 - Success
- 201 - Created
- 204 - Deleted
- 409 - Conflict (optimistic locking failure)
- 500 - Internal server error

## Authentication and Security

### Token Management
- Uses JWT (JSON Web Tokens) from RERUM registration
- Two-token system:
  - `ACCESS_TOKEN` - Short-lived, used for API requests
  - `REFRESH_TOKEN` - Long-lived, used to obtain new access tokens
- Automatic token refresh on startup
- Tokens stored in `.env` file (never exposed to clients)

### CORS Configuration
The application supports two CORS modes:

**1. Restricted Mode** (default):
- Only allows origins listed in `SERVICES_ORIGINS` environment variable
- Origins must be comma-separated
- Localhost origins are allowed in development

**2. Open API Mode**:
- Set `OPEN_API_CORS=true` in environment
- Allows requests from any origin
- Use for public API deployment

### Security Best Practices
- Tokens are NEVER sent to browser/client
- Origin-based access control via CORS
- User-agent header identifies requests as 'TinyPen'
- All sensitive configuration in `.env` (not in git)

## Testing

### Framework and Configuration
- **Jest** v29.7.0 with V8 coverage provider
- **Supertest** for HTTP endpoint testing
- Coverage reports in JSON, text, and HTML formats

### Running Tests
```bash
npm test          # Run Jest tests
npm run runtest   # Run tests with server instance
```

### Test Structure
Tests are located in `__tests__/mount.test.js` (144 lines) and verify:
- All expected routes are properly registered
- Both modern and legacy route patterns work
- Route handlers are correctly mounted

**Important**: Tests mock the token validation functions to avoid external dependencies.

## Deployment

### GitHub Actions Workflows

**Development Deployment** (`.github/workflows/cd_dev.yaml`):
- Triggers: PR to main branch (non-draft)
- Server: `vlcdhp02` (self-hosted runner)
- Process: Merges main into PR branch before deploying
- Command: `pm2 start -i max`
- Path: `/srv/node/tinyPen/`

**Production Deployment** (`.github/workflows/cd_prod.yaml`):
- Triggers: Push to main branch
- Server: `vlcdhprdp01` (self-hosted runner)
- Process: `git pull` → `npm install` → PM2 cluster restart
- Uses PM2 cluster mode for high availability

**Claude Integration** (`.github/workflows/claude.yaml`):
- Triggers: Issues/comments containing `@claude`
- Provides automated code assistance

### PM2 Process Management
- Cluster mode (`-i max`) for multi-core utilization
- Auto-restart on crashes
- Logs: `/srv/node/logs/tinypen.txt`

## Environment Configuration

### Required Environment Variables

```bash
# RERUM Authentication
ACCESS_TOKEN              # JWT access token from RERUM
REFRESH_TOKEN            # JWT refresh token from RERUM
RERUM_API_ADDR          # RERUM API base URL (e.g., https://api.rerum.io)
RERUM_ACCESS_TOKEN_URL  # Token refresh endpoint

# CORS Configuration
SERVICES_ORIGINS        # Comma-separated allowed origins
OPEN_API_CORS          # "true" for public API mode (optional)

# Server Configuration
PORT                    # Server port (default: 3002)
ORIGIN                  # Origin header for RERUM requests
```

### Setup Instructions
1. Copy `sample.env` to `.env`
2. Fill in required values
3. Register with RERUM to obtain tokens
4. Configure CORS settings for your deployment mode

## Coding Conventions

### Module System
- **ES6 modules** (`import`/`export`) throughout
- `"type": "module"` in package.json
- For `__dirname` in ES modules:
  ```javascript
  import { fileURLToPath } from 'url'
  import path from 'path'
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  ```

### Code Style
- **Double quotes** for strings
- **const/let** (never var)
- **Arrow functions** for callbacks
- **Template literals** for string interpolation
- **Async/await** for asynchronous operations

### Error Handling Pattern
```javascript
try {
  const response = await fetch(url, options)
  const data = await response.json()
  res.status(response.status).json(data)
} catch (err) {
  console.error(err)
  res.status(500).send("Error message")
}
```

### Naming Conventions
- **Route files**: lowercase with operation name (create.js, delete.js)
- **Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE (environment variables)

## Common Tasks and Workflows

### Adding a New Route
1. Create route handler in `/routes/newroute.js`:
   ```javascript
   import express from 'express'
   const router = express.Router()

   router.post('/', async (req, res) => {
     // Implementation
   })

   export default router
   ```

2. Register in `app.js`:
   ```javascript
   import newroute from './routes/newroute.js'
   app.use('/newroute', newroute)
   app.use('/app/newroute', newroute)  // Legacy support
   ```

3. Add tests in `__tests__/mount.test.js`

### Updating Dependencies
```bash
npm update              # Update to latest compatible versions
npm outdated            # Check for newer versions
npm audit fix           # Fix security vulnerabilities
```

### Debugging
- Enable debug output: `DEBUG=express:* npm start`
- Check PM2 logs: `pm2 logs tinyPen`
- View application logs: `/srv/node/logs/tinypen.txt` (production)

### Token Refresh Issues
If tokens expire:
1. Check `tokens.js:17` - token expiration detection logic
2. Verify `RERUM_ACCESS_TOKEN_URL` is correct
3. Ensure `REFRESH_TOKEN` is still valid
4. Check `.env` file write permissions

## Important Notes for AI Assistants

### When Making Changes

1. **Preserve Legacy Support**: Always register new routes under both `/` and `/app/` prefixes unless explicitly removing legacy support

2. **Token Security**: Never expose tokens to the client. All RERUM communication must happen server-side.

3. **CORS Configuration**: Be aware of the two CORS modes. Changes to CORS logic should maintain both modes.

4. **Error Handling**: Always include try-catch blocks in async route handlers and return appropriate HTTP status codes.

5. **Testing**: Update `__tests__/mount.test.js` when adding new routes.

6. **Environment Variables**: Never commit `.env` file. Update `sample.env` when adding new configuration options.

### Data Flow Understanding
```
Client → TinyPen → RERUM API
         ↓ adds auth header
         ↓ forwards request
         ↓ relays response
         → Client
```

### Optimistic Locking Implementation
The `/overwrite` endpoint (routes/overwrite.js:1) supports optimistic concurrency control:
- Checks for `If-Overwritten-Version` header in request
- If not present, tries to extract from `req.body.__rerum.isOverwritten.replaces`
- Forwards version to RERUM API
- Returns 409 Conflict if version mismatch detected by RERUM

### No Database
TinyPen does NOT maintain its own database. All data persistence is handled by the RERUM API. TinyPen is purely a proxy/gateway.

### Version Information
- Current version: 0.1.1 (see package.json:4)
- Node.js version: 22+ required
- Express version: 4.x (upgrade to 5.x requires changes)

## Troubleshooting Common Issues

### Port Already in Use
- Default port is 3002 (configurable via `PORT` env var)
- Check with: `lsof -i :3002`
- Kill process: `kill -9 <PID>`

### CORS Errors
- Verify `SERVICES_ORIGINS` includes requesting origin
- Check protocol (HTTP vs HTTPS) matches
- Consider using `OPEN_API_CORS=true` for testing
- Review CORS logic in app.js:15-37

### 401 Unauthorized from RERUM
- Token may have expired
- Check token refresh logic in tokens.js
- Verify `REFRESH_TOKEN` is still valid
- Re-register with RERUM if necessary

### Tests Failing
- Ensure all routes are registered in app.js
- Check that mock functions in tests match actual implementation
- Verify test expectations match current API behavior

## Future Considerations

1. **Legacy Route Removal**: `/app/*` routes can be removed in a future major version once all clients migrate

2. **TypeScript Migration**: Consider adding TypeScript for better type safety

3. **Rate Limiting**: May need rate limiting for public API mode

4. **Caching**: Consider caching frequently queried objects

5. **Request Validation**: Add JSON schema validation for incoming requests

6. **Logging**: Implement structured logging (Winston, Pino) instead of console.log

## Additional Resources

- [RERUM API Documentation](https://store.rerum.io/v1/API.html)
- [TPEN 3.0 Ecosystem](https://three.t-pen.org)
- [IIIF Presentation API](https://iiif.io/api/presentation/)
- [W3C Web Annotation](https://www.w3.org/TR/annotation-model/)
- [Web Components MDN](https://developer.mozilla.org/en-US/docs/Web/Web_Components)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [TPEN3 Project Homepage](https://three.t-pen.org)
- [TPEN3 Services API](https://dev.api.t-pen.org)
- [TPEN3 Services GitHub](https://github.com/CenterForDigitalHumanities/TPEN-services)
- [TPEN3 Interfaces GitHub](https://github.com/CenterForDigitalHumanities/TPEN-interfaces)
- [Express.js Documentation](https://expressjs.com)
- [PM2 Documentation](https://pm2.keymetrics.io)

## Additional Developer Preferences for AI Assistant Behavior

1. Do not automatically commit or push code.  Developers prefer to do this themselves when the time is right.
  - Make the code changes as requested.
  - Explain what changed and why.
  - Stop before committing.  The developer will decide at what point to commit changes on their own.  You do not need to keep track of it.
2. No auto compacting.  We will compact ourselves if the context gets too big.
3. When creating documentation do not add AIs as an @author.
4. Preference using current libraries and native javascript/ExpressJS/Node capabilities instead of installing new npm packages to solve a problem.
  - However, we understand that sometimes we need a package or a package is perfectly designed to solve our problem.  Ask if we want to use them in these cases.
5. We like colors in our terminals!  Be diverse and color text in the terminal for the different purposes of the text.  (ex. errors red, success green, logs bold white, etc.)
6. We like to see logs from running code, so expose those logs in the terminal logs as much as possible.
7. Use JDoc style for code documentation.  Cleanup, fix, or generate documentation for the code you work on as you encounter it. 
8. We use `npm start` often to run the app locally.  However, do not make code edits based on this assumption.  Production and development load balance in the app with pm2, not by using `npm start`

---

**Last Updated**: 2025-11-10
**Maintained By**: TPEN Development Team
**AI Assistant Notes**: This document should be updated whenever significant architectural changes are made to the codebase.
