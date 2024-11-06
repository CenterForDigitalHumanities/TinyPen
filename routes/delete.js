import express from "express"
const router = express.Router()

/* Legacy delete pattern w/body */

/* DELETE a delete to the thing. */
router.delete('/', async (req, res, next) => {
  try {
    const deleteBody = JSON.stringify(req.body)

    const deleteOptions = {
      method: 'DELETE',
      body: deleteBody,
      headers: {
        'user-agent': 'TinyPen',
        'Origin': process.env.ORIGIN,
        'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`,
        'Content-Type' : "application/json"
      }
    }
    const deleteURL = `${process.env.RERUM_API_ADDR}delete`
    const result = await fetch(deleteURL, deleteOptions).then(res => res.text())
    res.status(204)
    res.send(result)
  }
  catch (err) {
    console.log(err)
    res.status(500).send(`Caught Error:${err}`)
  }
})

/* DELETE a delete to the thing. */
router.delete('/:id', async (req, res, next) => {
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
