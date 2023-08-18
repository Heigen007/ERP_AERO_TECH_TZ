const router = require('express').Router()
const db = require('../../db')
const { handle_token, incorrect_token } = require('../../bearer')

router.get('/', async function (req, res) {
  try {
    if (!req.headers.authorization) return incorrect_token(res)

    const { token } = handle_token(res, req.headers.authorization)

    const user = (await db.query(`SELECT id FROM users WHERE bearer_token = '${token}'`))[0]
    if (!user) return incorrect_token(res)

    return res.json({ id: user.id })
  }
  catch (error) {
    console.log(`[ERROR] info -> "info/": ${error}`)
    return res.sendStatus(500)
  }
})

module.exports = router