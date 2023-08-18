const router = require('express').Router()
const multer = require('multer')

const upload = multer({ dest: require('./upload').upload_path })

router.post('/upload', upload.single('document'), require('./upload').upload)
router.get('/list/:user_id', require('./list'))
router.delete('/delete/:id', require('./delete').delete_by_id)
router.get('/download/:id', require('./download'))
router.put('/update/:id', upload.single('document'), require('./update'))
router.get('/:id', require('./getFile'))


module.exports = router