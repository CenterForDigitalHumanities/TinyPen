const express = require('express')
const router = express.Router()
const got = require('got')
const cors = require('cors')

/* POST a create to the thing. */
router.post('/', async (req, res, next) => {
  try {
    // check body for JSON
    console.log("POST in create.")
    console.log("REQUEST HEADERS")
    console.log(req.headers)
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

module.exports = router