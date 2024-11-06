import express from "express"
const router = express.Router()

/* POST a query to the thing. */
router.post('/', async (req, res, next) => {
  const lim = req.query.limit ?? 10
  const skip = req.query.skip ?? 0
  try {
    // check body for JSON
    const queryBody = JSON.stringify(req.body)
    // check limit and skip for INT
    if (isNaN(parseInt(lim) + parseInt(skip))
      || (lim < 0)
      || (skip < 0)) {
      throw Error("`limit` and `skip` values must be positive integers or omitted.")
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
    const results = await fetch(queryURL, queryOptions).then(resp => resp.json())
    res.status(200)
    res.send(results)
  }
  catch (err) { 
    console.log(err)
    res.status(500).send("Caught " + err)
  }
})

export default router
