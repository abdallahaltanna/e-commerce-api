import express from 'express'
import {
  getAllUsers,
  showCurrentUser,
  updateUser,
  updateUserPassword,
  getSingleUser
} from '../controllers/user.js'
import {
  authenticateUser,
  authorizePermissions
} from '../middlewares/authentication.js'

const router = express.Router()

router.get('/', authenticateUser, authorizePermissions('admin'), getAllUsers)
router.get('/showMe', authenticateUser, showCurrentUser)
router.patch('/updateUser', authenticateUser, updateUser)
router.patch('/updateUserPassword', authenticateUser, updateUserPassword)
router.get('/:id', authenticateUser, getSingleUser)

export default router
