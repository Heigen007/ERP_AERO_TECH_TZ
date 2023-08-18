const { v4: uuid } = require('uuid')
const db = require('./db')
require('dotenv').config()

function generate () {
  const date_now = new Date()
  date_now.setMinutes(date_now.getMinutes() + Number(process.env.BEARER_LIFETIME_IN_MINUTE))

  const bearer = {
    bearer_token: uuid(),
    refresh_token: uuid(),
    token_end_time: db.handle_date_for_db(date_now)
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

async function middleware (req, res, next) {
  try {
    const auth_required_routes = ['/info', '/logout', '/file']

    if(!auth_required_routes.includes('/' + req.originalUrl.split('/')[1])) return next()

    const auth = req.headers.authorization

    const { token } = handle_token(res, auth)

    const user = (await db.query(`SELECT token_end_time, refresh_token, id FROM users WHERE bearer_token = '${token}'`))[0]
    if (!user) return incorrect_token(res)
    if (new Date() > new Date(user.token_end_time)) return incorrect_token(res, 'authorization token expired')

    const update_result = await update(user.id, user.refresh_token)
    if (update_result.error) return res.status(400).send(`unknown error`)

    req.headers.authorization = `bearer ${update_result.bearer_token}`

    res.contentType('application/json')

    return next()
  }
  catch (error) {
    console.log(`[ERROR] bearer -> middleware: ${error}`)
  }
}

function incorrect_token (res, message = `incorrect authorization token`) {
  return res.status(400).send(message)
}

function handle_token (res, auth) {
  if (!auth) return incorrect_token(res)

  const [prefix, token] = auth.split(' ')
  if (!prefix || !token || typeof prefix !== 'string' || typeof token !== 'string')
    return incorrect_token(res)

  if (prefix.toLowerCase() !== process.env.TOKEN_PREFIX) return incorrect_token(res)

  return { prefix, token }
}

module.exports = {
  generate,
  update,
  middleware,
  incorrect_token,
  handle_token
}