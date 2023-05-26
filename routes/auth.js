import express from 'express'
import {
  login,
  register,
  logout,
  verifyEmail,
  forgetPassword,
  resetPassword
} from '../controllers/auth.js'

import 'express-async-errors'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.get('/logout', logout)
router.post('/verify-email', verifyEmail)
router.post('/forget-password', forgetPassword)
router.post('/reset-password', resetPassword)

export default router
