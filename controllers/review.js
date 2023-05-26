import Review from '../models/review.js'
import Product from '../models/product.js'
import BadRequestError from '../errors/bad-request.js'
import { checkPermission } from '../utils/jwt.js'
import { StatusCodes } from 'http-status-codes'

export const createReview = async (req, res) => {
  const { product: productId } = req.body
  const isValidProduct = await Product.findOne({ _id: productId })
  if (!isValidProduct) {
    throw new BadRequestError('No product with id: ' + productId)
  }

  const alreadySubmitted = await Review.findOne({
    product: productId,
    user: req.user.userId
  })
  if (alreadySubmitted) {
    throw new BadRequestError('Already submitted review for this product')
  }

  req.body.user = req.user.userId
  const review = await Review.create(req.body)
  res.status(StatusCodes.CREATED).json({ review })
}

export const getReviews = async (_, res) => {
  const reviews = await Review.find({}).populate({
    path: 'product',
    select: 'name company price'
  })
  res.status(StatusCodes.OK).json({ reviews, count: reviews.length })
}

export const getReview = async (req, res) => {
  const review = await Review.findById(req.params.id)
  if (!review) {
    throw new BadRequestError(`There is no review with id: ${req.params.id}`)
  }
  res.status(StatusCodes.OK).json({ review })
}

export const updateReview = async (req, res) => {
  const { id } = req.params
  const { title, comment, rating } = req.body
  const review = await Review.findById(id)
  if (!review) {
    throw new BadRequestError(`There is no review with id: ${id}`)
  }

  checkPermission(req.user, review.user)

  review.title = title
  review.comment = comment
  review.rating = rating

  await review.save()

  res.status(StatusCodes.OK).json({ review })
}
export const deleteReview = async (req, res) => {
  const { id } = req.params
  const review = await Review.findById(id)
  if (!review) {
    throw new BadRequestError(`There is no review with id: ${id}`)
  }

  checkPermission(req.user, review.user)

  await review.remove()
  res.status(StatusCodes.OK).json({ msg: 'Success, Review deleted!' })
}

export const getProductReviews = async (req, res) => {
  const { id: productId } = req.params
  const reviews = await Review.find({ product: productId })
  res.status(StatusCodes.OK).json({ reviews, count: reviews.length })
}
