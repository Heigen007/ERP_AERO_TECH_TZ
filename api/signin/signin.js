const router = require('express').Router()
const db = require('../../db')
const bearer = require('../../bearer')

router.post('/', async function (req, res) {
  try {
    if (!req.body.id) return res.status(400).send('field "id" is not defined')
    if (!req.body.password) return res.status(400).send('field "password" is not defined')

    const query = `SELECT password, bearer_token FROM users WHERE id = '${req.body.id}'`
    const response = (await db.query(query))[0]

    if (!response) return res.status(400).send(`User with id: ${req.body.id} does not exist`)
    if (response.password !== req.body.password) return res.status(400).send(`Incorrect password`)

    return res.json({bearer_token: response.bearer_token})
  }
  catch (error) {
    console.log(`[ERROR] signin -> "/": ${error}`)
    return res.sendStatus(500)
  }
})

router.post('/new_token', async function (req, res) {
  try {
    if (!req.body.refresh_token) return res.status(400).send('field "refresh_token" is not defined')

    const user = (await db.query(`SELECT id FROM users WHERE refresh_token = '${req.body.refresh_token}'`))[0]
    if (!user) return res.status(404).send(`incorrect refresh token`)

    const update_result = await bearer.update(user.id, req.body.refresh_token)

    if (update_result.error) return res.status(400).send(update_result.error)

    return res.json(update_result)
  }
  catch (error) {
    console.log(`[ERROR] signin -> "/new_token": ${error}`)
    return res.sendStatus(500)
  }
})

module.exports = router