var express = require('express')
var router = express.Router()
const path = require('path')

const root = path.join(__dirname,"../public")

/* There is no home page for now */
router.get('/', function(req, res, next) {
  res.status(404).send()
})

module.exports = router
