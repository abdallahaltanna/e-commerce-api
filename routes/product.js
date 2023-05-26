import express from 'express'
import {
  authenticateUser,
  authorizePermissions
} from '../middlewares/authentication.js'
import {
  createProduct,
  getProducts,
  uploadImage,
  updateProduct,
  deleteProduct,
  getProduct
} from '../controllers/product.js'
import { getProductReviews } from '../controllers/review.js'

const router = express.Router()

router
  .route('/')
  .get(getProducts)
  .post([authenticateUser, authorizePermissions('admin')], createProduct)

router.post(
  '/:id/uploadImage',
  [authenticateUser, authorizePermissions('admin')],
  uploadImage
)

router
  .route('/:id')
  .get(getProduct)
  .patch([authenticateUser, authorizePermissions('admin')], updateProduct)
  .delete([authenticateUser, authorizePermissions('admin')], deleteProduct)

router.get('/:id/reviews', getProductReviews)

export default router
