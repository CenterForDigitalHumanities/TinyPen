import express from "express"
import checkAccessToken from "../tokens.js"
import { fetchRerum } from "../rerum.js"

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
    await fetchRerum(deleteURL, deleteOptions)
    .then(async (resp) => {
        if (resp.ok) return
        // The response from RERUM indicates a failure, likely with a specific code and textual body
        let rerumErrorMessage
        try {
            rerumErrorMessage = `${resp.status ?? 500}: ${deleteURL} - ${await resp.text()}`
        } catch (e) {
            rerumErrorMessage = `500: ${deleteURL} - A RERUM error occurred`
        }
        const err = new Error(rerumErrorMessage)
        err.status = 502
        throw err
    })
    res.status(204).end()
  }
  catch (err) {
    console.error(err)
    res.status(err.status ?? 500).type('text/plain').send(err.message ?? 'An error occurred')
  }
})

export default router
