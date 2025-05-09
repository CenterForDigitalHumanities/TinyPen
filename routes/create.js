import express from "express"
const router = express.Router()

/* POST a create to the thing. */
router.post('/', async (req, res, next) => {
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
    const result = await fetch(createURL, createOptions).then(res => res.json())
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