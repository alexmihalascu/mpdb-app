const createNote = require('./createNote');
const deleteNote = require('./deleteNote');
const login = require('./login');
const logout = require('./logout');
const updateNote = require('./updateNote');
const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.post('/createNote', createNote)
router.post('/createNote', deleteNote)
router.post('/createNote', updateNote)
router.post('/createNote', logout)

module.exports = router