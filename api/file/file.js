const router = require('express').Router()
const multer = require('multer')

const upload = multer({ dest: require('./upload').upload_path })

router.post('/upload', upload.single('document'), require('./upload').upload)
// router.get('/list', require('./list'))
// router.delete('/delete/:id', require('./delete'))
// router.get('/download/:id', require('./download'))
// router.put('/update/:id', require('./update'))
router.get('/:id', require('./getFile'))


module.exports = router