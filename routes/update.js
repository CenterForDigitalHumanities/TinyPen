import express from "express"
import checkAccessToken from "../tokens.js"
import rest from "../rest.js"

const router = express.Router()

/* PUT an update to the thing. */
router.put('/', rest.jsonContent, checkAccessToken, async (req, res, next) => {

  try {
    // check for @id; any value is valid
    if (!(req.body['@id'] ?? req.body.id)) {
      throw Error("No record id to update! (https://store.rerum.io/API.html#update)")
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
    const rerumResponse = await fetch(updateURL, updateOptions)
    if (!rerumResponse.ok) {
      const errText = await rerumResponse.text()
      console.log(`RERUM UPDATE error ${rerumResponse.status}: ${errText}`)
      return res.status(rerumResponse.status).type('text/plain').send(errText)
    }
    const result = await rerumResponse.json()
    res.setHeader("Location", result["@id"] ?? result.id)
    res.status(200)
    res.send(result)
  }
  catch (err) {
    console.log(err)
    res.status(500).type('text/plain').send(`Caught Error: ${err}`)
  }
})

export default router
