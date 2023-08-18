const db = require('../../db')

module.exports = async function (req, res) {
  try {
    if (!req.params.id) return res.status(400).send('field "id" is not defined')

    const select_result = (await db.query(`SELECT * FROM files WHERE id = '${req.params.id}'`))[0]

    if (!select_result) return res.status(404).send(`Not found files with id: ${req.params.id}`)

    return res.json(select_result)
  }
  catch (error) {
    console.log(`[ERROR] file -> getFile -> "file/:id/": ${error}`)
    return res.sendStatus(500)
  }
}