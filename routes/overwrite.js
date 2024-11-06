import express from "express"
const router = express.Router()

/* PUT an overwrite to the thing. */
router.put('/', async (req, res, next) => {

  try {

    // check for @id; any value is valid
    if (!(req.body['@id'] ?? req.body.id)) {
      throw Error("No record id to overwrite! (https://centerfordigitalhumanities.github.io/rerum_server/API.html#overwrite)")
    }

    const overwriteBody = JSON.stringify(req.body)
    const overwriteOptions = {
      method: 'PUT',
      body: overwriteBody,
      headers: {
        'user-agent': 'TinyPen',
        'Origin': process.env.ORIGIN,
        'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`,
        'Content-Type' : "application/json;charset=utf-8"
      }
    }
    const overwriteURL = `${process.env.RERUM_API_ADDR}overwrite`
    const result = await fetch(overwriteURL, overwriteOptions).then(resp => resp.json())
    res.status(200)
    res.send(result)
  }
  catch (err) {
    console.log(err)
    res.status(500).send("Caught Error:" + err)
  }
})

export default router
