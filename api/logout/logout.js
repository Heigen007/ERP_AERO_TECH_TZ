const router = require('express').Router()
const db = require('../../db')
const bearer = require('../../bearer')
const { handle_token, incorrect_token } = require('../../bearer')

router.get('/', async function (req, res) {
  try {
    if (!req.headers.authorization) return incorrect_token(res)

    const { token } = handle_token(res, req.headers.authorization)

    const user = (await db.query(`SELECT id, refresh_token FROM users WHERE bearer_token = '${token}'`))[0]
    if (!user) return incorrect_token(res)

    const update_result = await bearer.update(user.id, user.refresh_token)
    if (update_result.error) return res.status(400).send('unknown error')

    return res.json(update_result)
  }
  catch (error) {
    console.log(`[ERROR] logout -> "logout/": ${error}`)
    return res.sendStatus(500)
  }
})


module.exports = router