import express from "express"
import rest from "../rest.js"

const router = express.Router()

/* POST a query to the thing. */
router.post('/', rest.verifyJsonContentType, async (req, res, next) => {
  const lim = req.query.limit ?? 10
  const skip = req.query.skip ?? 0
  try {
    // check body for JSON
    const queryBody = JSON.stringify(req.body)
    // If there is an empty query with [] or {}, we consider that a query for all data, 
    // which we don't want to allow. We will throw a 400 error.
    if (queryBody === '{}' || queryBody === '[]') {
      const err = new Error("Empty query is not allowed. Please provide a valid query in the request body.")
      err.status = 400
      throw err
    }
    // check limit and skip for INT
    if (isNaN(parseInt(lim) + parseInt(skip))
      || (lim < 0)
      || (skip < 0)) {
      const err = new Error("`limit` and `skip` values must be positive integers or omitted.")
      err.status = 400
      throw err
    }
    const queryOptions = {
      method: 'POST',
      body: queryBody,
      headers: {
        'user-agent': 'TinyPen',
        'Origin': process.env.ORIGIN,
        'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`, // not required for query
        'Content-Type' : "application/json;charset=utf-8"
      }
    }
    const queryURL = `${process.env.RERUM_API_ADDR}query?limit=${lim}&skip=${skip}`
    const rerumResponse = await fetch(queryURL, queryOptions)
    if (!rerumResponse.ok) {
      const errText = await rerumResponse.text()
      console.error(`RERUM QUERY error ${rerumResponse.status}: ${errText}`)
      return res.status(rerumResponse.status).type('text/plain').send(errText)
    }
    const results = await rerumResponse.json()
    res.status(200)
    res.send(results)
  }
  catch (err) { 
    console.error(err)
    res.status(err.status ?? 500).type('text/plain').send(`Caught Error: ${err}`)
  }
})

export default router
