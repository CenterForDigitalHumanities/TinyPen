import express from 'express'
const router = express.Router()

/* There is no home page for now */
router.get('/', (req, res, next) => {
  res.status(404).send()
})

export default router
