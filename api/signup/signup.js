const router = require('express').Router()
const bearer = require('../../bearer')
const db = require('../../db')


router.post('/', async function (req, res) {
  try {
    if (!req.body.id) return res.status(400).send('field "id" is not defined')
    if (!req.body.password) return res.status(400).send('field "password" is not defined')

    const token = bearer.generate()

    const query = `
      INSERT INTO users (id, password, bearer_token, refresh_token, token_end_time) VALUES ('${req.body.id}', '${req.body.password}', '${token.bearer_token}', '${token.refresh_token}', STR_TO_DATE('${token.token_end_time}', "%m-%d-%Y %H:%i:%s"));
    `.trim()

    const response = await db.query(query)

    if (response.affectedRows < 1) return res.status(400).send('Failed to create user due to unknown error')

    return res.json(token)
  }
  catch (error) {
    console.log(`[ERROR] signup -> "/": ${error}`)
    return res.sendStatus(500)
  }
})


module.exports = router