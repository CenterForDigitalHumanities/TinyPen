This file provides guidance to AI Assistants when working with code in this repository.

## Project Overview

**TinyPen** is a Node.js middleware/proxy application that provides secure, authenticated access to the RERUM API (a versioned object store). This application is part of the TPEN 3.0 ecosystem for transcription and paleography education and research.

## Data Flow Understanding
```
Client → TinyPen → RERUM API
         ↓ adds auth header
         ↓ forwards request
         ↓ relays response
         → Client
```

## No Database

TinyPen does NOT maintain its own database. All data persistence is handled by the RERUM API. TinyPen is purely a proxy/gateway.

## Additional Resources

- [TPEN 3.0 Ecosystem](https://three.t-pen.org)
- [TPEN3 Interfaces GitHub](https://github.com/CenterForDigitalHumanities/TPEN-interfaces)
- [TPEN3 Services GitHub](https://github.com/CenterForDigitalHumanities/TPEN-services)
- [TinyPEN GitHub](https://github.com/CenterForDigitalHumanities/TinyPEN)
- [RERUM API GitHub](https://github.com/CenterForDigitalHumanities/rerum_server_nodejs)
- [TPEN3 Services API Documentation](https://api.t-pen.org/API.html)
- [RERUM API Documentation](https://store.rerum.io/v1/API.html)

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
