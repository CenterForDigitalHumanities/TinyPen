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
        'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`
      }
    }
    const result = await fetch(deleteURL, deleteOptions).then(resp => resp.text())
    res.status(204)
    res.send(result)
  }
  catch (err) {
    console.log(err)
    res.status(500).send(`Caught Error:${err}`)
  }
})

export default router
