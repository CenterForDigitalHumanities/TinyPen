import express from "express"
import checkAccessToken from "../tokens.js"
import rest from "../rest.js"

const router = express.Router()

/* PUT an overwrite to the thing. */
router.put('/', rest.verifyJsonContentType, checkAccessToken, async (req, res, next) => {

  try {
    
    const overwriteBody = req.body
    // check for @id; any value is valid
    if (!(overwriteBody['@id'] ?? overwriteBody.id)) {
      throw Error("No record id to overwrite! (https://store.rerum.io/API.html#overwrite)")
    }

    const overwriteOptions = {
      method: 'PUT',
      body: JSON.stringify(overwriteBody),
      headers: {
        'user-agent': 'TinyPen',
        'Origin': process.env.ORIGIN,
        'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`,
        'Content-Type' : "application/json;charset=utf-8"
      }
    }

    // Pass through If-Overwritten-Version header if present
    const ifOverwrittenVersion = req.headers['if-overwritten-version']
    if (ifOverwrittenVersion) {
      overwriteOptions.headers['If-Overwritten-Version'] = ifOverwrittenVersion
    }

    // Check for __rerum.isOverwritten in body and use as If-Overwritten-Version header
    const isOverwrittenValue = req.body?.__rerum?.isOverwritten
    if (isOverwrittenValue) {
      overwriteOptions.headers['If-Overwritten-Version'] = isOverwrittenValue
    }

    const overwriteURL = `${process.env.RERUM_API_ADDR}overwrite`
    const rerumResponse = await fetch(overwriteURL, overwriteOptions)
    .then(async (resp) => {
        if (resp.ok) return resp.json()
        // The response from RERUM indicates a failure, likely with a specific code and textual body
        let rerumErrorMessage
        try {
            rerumErrorMessage = `${resp.status ?? 500}: ${updateURL} - ${await resp.text()}`
        } catch (e) {
            rerumErrorMessage = `500: ${updateURL} - A RERUM error occurred`
        }
        const err = new Error(rerumErrorMessage)
        err.status = 502
        throw err
    })
    .catch(err => {
        if (err.status === 502) throw err
        const genericRerumNetworkError = new Error(`500: ${updateURL} - A RERUM error occurred`)
        genericRerumNetworkError.status = 502
        throw genericRerumNetworkError
    })
    if (!(rerumResponse.id || rerumResponse["@id"])) {
        // A 200 with garbled data, call it a fail
        const genericRerumNetworkError = new Error(`500: ${updateURL} - A RERUM error occurred`)
        genericRerumNetworkError.status = 502
        throw genericRerumNetworkError
    }
    res.setHeader("Location", rerumResponse["@id"] ?? rerumResponse.id)
    res.status(200).json(rerumResponse)
  }
  catch (err) {
    console.error(err)
    res.status(500).type('text/plain').send(`Caught Error: ${err}`)
  }
})

export default router
