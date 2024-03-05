const express = require('express')
const router = express.Router()
const got = require('got')
const cors = require('cors')

/**
 *  Note that origin must be a string in the response.
 *  The cors middleware allows registration via an Array of origins.
 *  However, Allow-Origin response headers must be a string with a single origin or '*'
 *  If we have multiple origins, we need to determine the origin to set the response header correctly in the routes.  
 *  See https://saumya.github.io/ray/articles/96/
 */
const corsOrigin = process.env.OPEN_API_CORS == "true" ? "*" : process.env.SERVICES_ORIGINS.split(",")
router.use(cors({
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
router.use(function(req, res, next) {
  console.log("REQUEST HEADERS")
  console.log(req.headers)
  let origin = req.headers.origin ? req.headers.origin : req.headers.host ?? "unknown"
  console.log(`origin of request: '${origin}'`)
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
    console.log("CORS allows this origin")
    console.log(origin)
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  else{
    // No CORS for you.
    console.log("No cors for you")
    console.log(origin)
    res.setHeader('Access-Control-Allow-Origin', "")
  }
  next()
})

/* POST a create to the thing. */
router.post('/', async (req, res, next) => {
  try {
    // check body for JSON
    JSON.stringify(req.body)
    const createBody = req.body
    const createOptions = {
      json: createBody,
      headers: {
        'user-agent': 'Tiny-Pen',
        'Origin': process.env.ORIGIN,
        'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`, // not required for query
        'Content-Type' : "application/json;charset=utf-8"
      }
    }
    const createURL = `${process.env.RERUM_API_ADDR}create`
    const result = await got.post(createURL, createOptions).json()
    res.setHeader("Location", result["@id"])
    res.status(201)
    console.log("RESPONSE HEADERS FROM CREATE SUCCESS")
    console.log(res.getHeaders())
    res.send(result)
  }
  catch (err) {
    console.log(err)
    res.status(500).send("Caught Error:" + err)
  }
})

router.options('/', async (req, res, next) => {
  res.status(200)
  res.send()
})

module.exports = router
