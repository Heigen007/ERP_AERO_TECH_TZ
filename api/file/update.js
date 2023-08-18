const db = require('../../db')
const { deleteFile } = require('./delete')
const { errorDeleteFile, waitFileUpload, handleNewFile, upload_path } = require('./upload')

module.exports = async function (req, res) {
  try {
    if (!req.file) return res.status(400).send('file is not included in request')

    const waitFileResult = await waitFileUpload(req.file.filename, 5000, upload_path)
    if (!waitFileResult) return res.status(400).send('Unknown error on file uploading')
    if (!req.params.id) return await errorDeleteFile({ res, status: 400, message: 'field "id" is not defined', upload_path, filename: req.file.filename })

    const old_file = (await db.query(`SELECT id, user_id FROM files WHERE id = '${req.params.id}'`))[0]
    if (!old_file) return await errorDeleteFile({ res, status: 404, message: `File with id: ${req.params.id} not found`, upload_path, filename: req.file.filename })

    const delete_result = await deleteFile(req.params.id, upload_path)
    if (delete_result?.error) return await errorDeleteFile({ res, status: delete_result.status, message: delete_result.error, upload_path, filename: req.file.filename })

    const file = await handleNewFile(req.file.filename, req.file.originalname, upload_path, old_file.id)
    if (file.error) return await errorDeleteFile({ res, status: 400, message: file.error, upload_path, filename: req.file.filename })

    const query = `INSERT INTO files (id, user_id, url, name, original_name, extension, mime_type, m_size, upload_date) VALUES ('${file.filename}', '${old_file.user_id}', '${process.env.SERVER_URL}/file/download/${file.filename}', '${file.filename + '.' + file.extension}', '${req.file.originalname}', '${file.extension}', '${req.file.mimetype}', ${req.file.size}, STR_TO_DATE('${db.handle_date_for_db(new Date())}', "%m-%d-%Y %H:%i:%s"));`
    const insert_result = await db.query(query)

    if (insert_result.affectedRows < 1) return await errorDeleteFile({ res, status: 400, message: 'Failed to create file due to unknown error', upload_path, filename: file.filename })

    return res.sendStatus(200)
  }
  catch (error) {
    console.log(`[ERROR] file -> update -> "file/update/:id": ${error}`)
    return res.sendStatus(500)
  }
}