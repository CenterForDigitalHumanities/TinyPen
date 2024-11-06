import express from "express"
const router = express.Router()

/* PUT an update to the thing. */
router.put('/', async (req, res, next) => {

  try {
    // check for @id; any value is valid
    if (!(req.body['@id'] ?? req.body.id)) {
      throw Error("No record id to overwrite! (https://centerfordigitalhumanities.github.io/rerum_server/API.html#overwrite)")
    }

    const updateBody = JSON.stringify(req.body)
    const updateOptions = {
      method: 'PUT',
      body: updateBody,
      headers: {
        'user-agent': 'TinyPen',
        'Origin': process.env.ORIGIN,
        'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`, // not required for query
        'Content-Type' : "application/json;charset=utf-8"
      }
    }
    const updateURL = `${process.env.RERUM_API_ADDR}update`
    const result = await fetch(updateURL, updateOptions).then(resp => resp.json())
    res.status(200)
    res.send(result)
  }
  catch (err) {
    console.log(err)
    res.status(500).send("Caught Error:" + err)
  }
})

export default router
