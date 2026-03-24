import express from "express"
import checkAccessToken from "../tokens.js"

const router = express.Router()

/* POST a create to the thing. */
router.post('/', checkAccessToken, async (req, res, next) => {
  try {
    // if an id is passed in, pop off the end to make it an _id
    if (req.body.id) {
      req.body._id = req.body.id.split('/').pop()
    }
    // check body for JSON
    const createBody = JSON.stringify(req.body)
    const createOptions = {
      method: 'POST',
      body: createBody,
      headers: {
        'user-agent': 'TinyPen',
        'Origin': process.env.ORIGIN,
        'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`, // not required for query
        'Content-Type' : "application/json;charset=utf-8"
      }
    }
    const createURL = `${process.env.RERUM_API_ADDR}create`
    const rerumResponse = await fetch(createURL, createOptions)
    if (!rerumResponse.ok) {
      const errText = await rerumResponse.text()
      console.log(`RERUM CREATE error ${rerumResponse.status}: ${errText}`)
      return res.status(rerumResponse.status).type('text/plain').send(errText)
    }
    const result = await rerumResponse.json()
    res.setHeader("Location", result["@id"] ?? result.id)
    res.status(201)
    res.send(result)
  }
  catch (err) {
    console.log(err)
    res.status(500).send(`Caught Error:${err}`)
  }
})

export default router