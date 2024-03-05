#!/usr/bin/env node
var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
var dotenv = require('dotenv')
var dotenvExpand = require('dotenv-expand')
var storedEnv = dotenv.config()
dotenvExpand.expand(storedEnv)

require('./tokens.js')

var indexRouter = require('./routes/index')
var queryRouter = require('./routes/query')
var createRouter = require('./routes/create')
var updateRouter = require('./routes/update')
var deleteRouter = require('./routes/delete')
var overwriteRouter = require('./routes/overwrite')
const cors = require('cors')
var app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(logger('dev'))
app.use(express.json())
/**
 *  Note that origin must be a string in the response.
 *  The cors middleware allows registration via an Array of origins.
 *  However, Allow-Origin response headers must be a string with a single origin or '*'
 *  If we have multiple origins, we need to determine the origin to set the response header correctly in the routes.  
 *  See https://saumya.github.io/ray/articles/96/
 */
const corsOrigin = process.env.OPEN_API_CORS == "true" ? "*" : process.env.SERVICES_ORIGINS.split(",")
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
    "origin" : corsOrigin,
    "maxAge" : "600"
}))

/**
 * Prepare the Access-Control-Allow-Origin header before entering routes.
 * Proper Access-Control-Allow-Origin headers are a single URL or *
 */ 
app.use(function(req, res, next) {
  let origin = req.headers.origin ? req.headers.origin : req.headers.host ?? "unknown"
  const allowedOrigins = process.env.SERVICES_ORIGINS.split(",")
  if(!(origin.startsWith("http://") || origin.startsWith("https://"))){
    // We will need to determine which to add. localhost is always http://
    if(origin.includes("localhost") || origin.includes("127.0.0.1")) origin = "http://"+origin
    else{ 
      // This client request did not have a proper Access-Control-Allow-Origin header so we used the HOST header which may not include protocol.
      // We can error.  Pretending they are https will probably work 95% of the time.
      origin = "https://"+origin 
    }
  }
  if(allowedOrigins.includes(origin) || origin.includes("localhost")){
    // We are OK with any localhost URL or any allowed origins from the app settings.
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  else{
    // No CORS for you.
    res.setHeader('Access-Control-Allow-Origin', "")
  }
  next()
})

app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)

//New available usage without /app
app.use('/query', queryRouter)
app.use('/create', createRouter)
app.use('/update', updateRouter)
app.use('/delete', deleteRouter)
app.use('/overwrite', overwriteRouter)

//Legacy support for /app
app.use('/app', indexRouter)
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
  res.render('error')
})

module.exports = app
