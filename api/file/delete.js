const db = require('../../db')
const path = require('path')
const fs = require('fs')
const { upload_path } = require('./upload')

async function delete_by_id (req, res) {
  try {
    if (!req.params.id) return res.status(400).send('field "id" is not defined')

    const delete_result = await deleteFile (req.params.id, upload_path)
    if (delete_result?.error) return res.status(delete_result.status).send(delete_result.error)

    return res.sendStatus(200)
  }
  catch (error) {
    console.log(`[ERROR] file -> delete -> "file/delete/:id": ${error}`)
    return res.sendStatus(500)
  }
}

async function deleteFile (id, upload_path) {
  const target_file = (await db.query(`SELECT name FROM files WHERE id = '${id}'`))[0]
  if (!target_file) return { error: `File with id: ${id} not found`, status: 404 }

  const delete_result = await db.query(`DELETE FROM files WHERE id = '${id}'`)
  if (delete_result.affectedRows < 1) return { error: 'Failed to delete file due to unknown error', status: 400 }

  return await fs.promises.unlink(path.join(upload_path, target_file.name))
}

module.exports = {
  delete_by_id,
  deleteFile
}