const mysql = require('mysql')
require('dotenv').config()

// devlare connection to mysql db
const connection_options = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
}
const connection = mysql.createConnection(connection_options)

async function connect () {
  return new Promise((resolve, reject) => {
    connection.connect(async (error) => {
      if (error) reject(error)

      console.log(`mysql connected as id: ${connection.threadId}`)
      resolve(connection)
    })
  })
}

async function query (query) {
  return new Promise((resolve, reject) => {
    connection.query(query, function (error, results, fields) {
      if (error) reject(error)

      console.log(results)

      resolve(results)
    })
  })
}

module.exports = {
  connection,
  connect,
  query
}