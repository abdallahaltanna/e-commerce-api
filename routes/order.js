import express from 'express'
import {
  authenticateUser,
  authorizePermissions
} from '../middlewares/authentication.js'
import {
  createOrder,
  getOrder,
  updateOrder,
  getAllOrders,
  getUserOrders
} from '../controllers/order.js'

const router = express.Router()

router
  .route('/')
  .post(authenticateUser, createOrder)
  .get([authenticateUser, authorizePermissions('admin')], getAllOrders)

router.get('/showMyOrders').get(authenticateUser, getUserOrders)

router
  .route('/:id')
  .get(authenticateUser, getOrder)
  .patch(authenticateUser, updateOrder)

export default router
