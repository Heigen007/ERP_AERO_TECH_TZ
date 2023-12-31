const express = require('express')
const bodyParser = require('express')
const cors = require('cors')
const db = require('./db')

require('dotenv').config()

const app = express()

// base setting up middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(require('./bearer').middleware)
app.use(cors())

// init application
async function init () {
  await db.connect()

  app.listen(process.env.PORT, '0.0.0.0', (error) => {
    if (error) return new Error(`error in starting server, error: ${error}`)
    else console.log(`server started on \n\tPORT: ${process.env.PORT}`)
  })

  app.use('/signin', require('./api/signin/signin'))
  app.use('/signup', require('./api/signup/signup'))
  app.use('/file', require('./api/file/file'))
  app.use('/info', require('./api/info/info'))
  app.use('/logout', require('./api/logout/logout'))
}

init ()
  .catch (error => {
    console.log({error})
    process.exit(0)
  })