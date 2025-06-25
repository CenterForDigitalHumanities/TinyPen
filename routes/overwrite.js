import express from "express"
const router = express.Router()

/* PUT an overwrite to the thing. */
router.put('/', async (req, res, next) => {

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
    const response = await fetch(overwriteURL, overwriteOptions)
    
    // Handle 409 conflict error for version mismatch
    if (response.status === 409) {
      const errorData = await response.json()
      return res.status(409).json(errorData)
    }

    const result = await response.json()
    res.setHeader("Location", result["@id"] ?? result.id)
    res.status(200)
    res.send(result)
  }
  catch (err) {
    console.log(err)
    res.status(500).send("Caught Error:" + err)
  }
})

export default router
