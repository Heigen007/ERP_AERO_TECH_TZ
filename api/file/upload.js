const fs = require('fs')
const path = require('path')
const { v4: uuid } = require('uuid')
const db = require('../../db')
const upload_path = path.resolve(path.join(__dirname, '../../uploads/'))

async function upload (req, res) {
  try {
    if (!req.file) return res.status(400).send('file is not included to request')

    const waitFileResult = await waitFileUpload(req.file.filename, 5000, upload_path)
    if (!waitFileResult) return res.status(400).send('Unknown error on file uploading')
    if (!req.body.id) return await errorDeleteFile({ res, status: 400, message: 'field "id" is not defined', upload_path, filename: req.file.filename })

    const file = await handleNewFile(req.file.filename, req.file.originalname, upload_path)
    if (file.error) return await errorDeleteFile({ res, status: 400, message: file.error, upload_path, filename: req.file.filename })

    const date_now = new Date()
    const upload_date = `${date_now.getMonth() + 1}-${date_now.getDate()}-${date_now.getFullYear()} ${date_now.getHours()}:${date_now.getMinutes()}:${date_now.getSeconds()}`

    const query = `INSERT INTO files (id, user_id, name, original_name, extension, mime_type, m_size, upload_date) VALUES ('${file.filename}', '${req.body.id}', '${file.filename + '.' + file.extension}', '${req.file.originalname}', '${file.extension}', '${req.file.mimetype}', ${req.file.size}, STR_TO_DATE('${upload_date}', "%m-%d-%Y %H:%i:%s"));`
    const insert_result = await db.query(query)

    if (insert_result.affectedRows < 1) return await errorDeleteFile({ res, status: 400, message: 'Failed to create file due to unknown error', upload_path, filename: file.filename })

    return res.sendStatus(200)
  }
  catch (error) {
    console.log(`[ERROR] file -> upload -> "file/upload/": ${error}`)
    return res.sendStatus(500)
  }
}

async function errorDeleteFile ({res, status, message, upload_path, filename}) {
  await fs.promises.unlink(path.join(upload_path, filename))
  return res.status(status).send(message)
}

async function handleNewFile (filename, originalname, upload_path) {
  const splitted_originalname = originalname.split('.')
  if (splitted_originalname.length <= 1) return { error: 'Not have extension of file' }
  const file_extension = splitted_originalname.at(-1)
  const new_file_name = uuid()

  await fs.promises.rename(
    path.join(upload_path, filename),
    path.join(upload_path, `${new_file_name}.${file_extension}`)
  )

  return { extension: file_extension, filename: new_file_name }
}

async function waitFileUpload (filename, max_ms_delay, upload_path) {
  const interval_delay = 200
  const max_count_of_iterations = max_ms_delay / interval_delay
  let count_of_iterations = 0

  return new Promise((resolve, reject) => {
    const interval_id = setInterval(() => {
      if (count_of_iterations >= max_count_of_iterations) {
        clearInterval(interval_id)
        return reject(false)
      }

      const dir_files = fs.readdirSync(upload_path)
      if (dir_files.includes(filename)) {
        clearInterval(interval_id)
        return resolve(true)
      }

      count_of_iterations++
    }, interval_delay)
  })
}

module.exports = {
  upload,
  upload_path
}