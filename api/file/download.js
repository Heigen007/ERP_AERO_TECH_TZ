const db = require('../../db')
const path = require('path')
const { upload_path } = require('./upload')

module.exports = async function (req, res) {
  try {
    if (!req.params.id) return res.status(400).send('field "id" is not defined')

    const target_file = (await db.query(`SELECT name FROM files WHERE id = '${req.params.id}'`))[0]
    if (!target_file) return res.status(404).send(`File with id: ${req.params.id} not found`)

    return res.download(path.join(upload_path, target_file.name))
  }
  catch (error) {
    console.log(`[ERROR] file -> download -> "file/download/:id": ${error}`)
    return res.sendStatus(500)
  }
}