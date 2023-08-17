const { v4: uuid } = require('uuid')
const db = require('./db')
require('dotenv').config()

function generate () {
  const date_now = new Date()

  date_now.setMinutes(date_now.getMinutes() + Number(process.env.BEARER_LIFETIME_IN_MINUTE))

  const bearer = {
    bearer_token: uuid(),
    refresh_token: uuid(),
    token_end_time: `${date_now.getMonth() + 1}-${date_now.getDate()}-${date_now.getFullYear()} ${date_now.getHours()}:${date_now.getMinutes()}:${date_now.getSeconds()}`
  }

  return bearer
}

async function update (id, refresh_token) {
  const query = `SELECT refresh_token FROM users WHERE id = '${id}'`
  const response = (await db.query(query))[0]

  if (!response) return { error: `User with id: ${id} does not exist` }
  if (response.refresh_token !== refresh_token) return { error: 'Incorrect refresh_token' }

  const { bearer_token, token_end_time } = generate()
  const update_token_query = `UPDATE users SET bearer_token = '${bearer_token}', token_end_time = STR_TO_DATE('${token_end_time}', "%m-%d-%Y %H:%i:%s") WHERE id = '${id}'`
  const update_token_response = await db.query(update_token_query)

  if (update_token_response.affectedRows < 1) return { error: 'Failed to update token due to unknown error' }

  return { bearer_token, token_end_time }
}

module.exports = {
  generate,
  update
}