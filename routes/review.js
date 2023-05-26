import express from 'express'
import { authenticateUser } from '../middlewares/authentication.js'
import {
  createReview,
  getReviews,
  getReview,
  updateReview,
  deleteReview
} from '../controllers/review.js'

const router = express.Router()

router.route('/').post(authenticateUser, createReview).get(getReviews)
router
  .route('/:id')
  .get(getReview)
  .patch(authenticateUser, updateReview)
  .delete(authenticateUser, deleteReview)

export default router
