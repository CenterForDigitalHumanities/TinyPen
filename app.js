#!/usr/bin/env node
import createError from "http-errors"
import express from "express"
import path from "path"
import { fileURLToPath } from "url"
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
import indexRouter from "./routes/index.js"
import queryRouter from "./routes/query.js"
import createRouter from "./routes/create.js"
import updateRouter from "./routes/update.js"
import deleteRouter from "./routes/delete.js"
import overwriteRouter from "./routes/overwrite.js"
import cors from "cors"
import {updateExpiredToken } from "./tokens.js"

// Check for and update token on app start
updateExpiredToken()
let app = express()
app.use(express.json())
if(process.env.OPEN_API_CORS !== "false") { 
  // This enables CORS for all requests. We may want to update this in the future and only apply to some routes.
  app.use(cors()) 
}
app.use(express.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))

/**
 *  Note that origin must be a string in the response.
 *  The cors() middleware allows registration via an Array of origins.
 *  However, Access-Control-Allow-Origin response headers must be a string with a single origin URL or '*'
 *  If we have multiple supported origins, we need to determine the correct origin being used in downstream middleware. 
 */
const corsAllowedOrigins = process.env.OPEN_API_CORS == "true" ? "*" : process.env.SERVICES_ORIGINS.split(",")
app.use(cors({
    "methods" : "GET",
    "allowedHeaders" : [
      'Content-Type',
      'Content-Length',
      'Allow',
      'Authorization',
      'Location',
      'ETag',
      'Connection',
      'Keep-Alive',
      'Date',
      'Cache-Control',
      'Last-Modified',
      'Link',
      'X-HTTP-Method-Override'
    ],
    "exposedHeaders" : "*",
    "origin" : corsAllowedOrigins,
    "maxAge" : "600"
}))

/**
 * Prepare the response Access-Control-Allow-Origin header before entering routes.
 * Proper Access-Control-Allow-Origin headers are a single URL or '*'.
 * If the determined origin is not in process.env.SERVICES_ORIGINS, that origin client will experience a CORS error.
 * SPECIAL SUPPORT
 * Requests may not contain an Origin header or a Referrer header.  These requests are considered improper for CORS.
 * However, when this occurs we can try the Host header value which should always be present.  
 * The Host header does not include protocol.  No other part of the request contains the protocol.
 * The protocol must be a part of the Access-Control-Allow-Origin value if it is not '*'.
 * If the protocol written to the header does not match that of the origin client, origin clients will experience a CORS error.
 */ 
if(corsAllowedOrigins !== "*") {
  app.use(function(req, res, next) {
    let origin = 
      req.headers.origin ? req.headers.origin 
      : req.headers.referrer ? req.headers.referrer
      : req.headers.host ?? "unknown"
    // The origin must not end with /
    if(origin.endsWith("/")) origin = origin.slice(0, -1)
    const allowedOrigins = process.env.SERVICES_ORIGINS.split(",")
    if(!(origin.startsWith("http://") || origin.startsWith("https://"))){
      if(origin.includes("localhost") || origin.includes("127.0.0.1")) origin = "http://"+origin
      else{ 
        // Instead of erroring, we pretend they are HTTPS as this is the most likely scenario
        // If we are wrong, browsers with throw a CORS error like they should have anyway.
        origin = "https://"+origin 
      }
    }
    // Note localhost is not registered with process.env.SERVICES_ORIGINS.  Doing it here lets us support all ports.
    if(allowedOrigins.includes(origin) || (process.env.LOCALHOSTMODE === "true" && origin.includes("localhost"))){
      res.setHeader('Access-Control-Allow-Origin', origin)
    }
    else{
      // No CORS for you.
      res.removeHeader("Access-Control-Allow-Origin")
    }
    next()
  })
}

//New available usage without /app
app.use('/query', queryRouter)
app.use('/create', createRouter)
app.use('/update', updateRouter)
app.use('/delete', deleteRouter)
app.use('/overwrite', overwriteRouter)

//Legacy support for /app
app.use('/app/query', queryRouter)
app.use('/app/create', createRouter)
app.use('/app/update', updateRouter)
app.use('/app/delete', deleteRouter)
app.use('/app/overwrite', overwriteRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404))
})

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.send(err.message)
})

export default app