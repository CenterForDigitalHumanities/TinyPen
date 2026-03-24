import express from "express"
import checkAccessToken from "../tokens.js"

const router = express.Router()

/**
 * DELETE an object by ID via the RERUM API.
 * @route DELETE /delete/:id
 * @param {string} id - The RERUM object ID to delete
 */
router.delete('/:id', checkAccessToken, async (req, res, next) => {
  try {
  
    const deleteURL = `${process.env.RERUM_API_ADDR}delete/${req.params.id}`
    const deleteOptions = {
      method: "DELETE",
      headers: {
        'user-agent': 'TinyPen',
        'Origin': process.env.ORIGIN,
        'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`
      }
    }
    const rerumResponse = await fetch(deleteURL, deleteOptions)
    if (!rerumResponse.ok) {
      const errText = await rerumResponse.text()
      console.error(`RERUM DELETE error ${rerumResponse.status}: ${errText}`)
      return res.status(rerumResponse.status).type('text/plain').send(errText)
    }
    res.status(204).end()
  }
  catch (err) {
    console.error(err)
    res.status(500).type('text/plain').send(`Caught Error: ${err}`)
  }
})

export default router
