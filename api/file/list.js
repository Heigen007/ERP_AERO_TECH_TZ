const db = require('../../db')
require('dotenv').config()

module.exports = async function (req, res) {
  try {
    if (!req.params.user_id) return res.status(400).send('field "user_id" is not defined')
    const list_size = req.query.list_size ? Number(req.query.list_size) : 10
    const page = req.query.page ? Number(req.query.page) : 1

    const files = (await db.query(`SELECT * FROM files WHERE user_id = '${req.params.user_id}'`))

    const paginated_files = [...files].splice((page - 1) * list_size, list_size)
    const page_count = Math.ceil(files.length / list_size)

    return res.json({
      info: {
        general_length: files.length,
        payload_length: paginated_files.length,
        page_count,
        prev_page: page - 1 < 1 ? null : `${process.env.SERVER_URL}/file/list/${req.params.user_id}?page=${page - 1}&list_size=${list_size}`,
        current_page: `${process.env.SERVER_URL}/file/list/${req.params.user_id}?page=${page}&list_size=${list_size}`,
        next_page: page_count < page + 1 ? null : `${process.env.SERVER_URL}/file/list/${req.params.user_id}?page=${page + 1}&list_size=${list_size}`
      },
      payload: paginated_files
    })
  }
  catch (error) {
    console.log(`[ERROR] file -> list -> "file/list/:user_id": ${error}`)
    return res.sendStatus(500)
  }
}