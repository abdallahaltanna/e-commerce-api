import Product from '../models/product.js'
import BadRequestError from '../errors/bad-request.js'
import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'
import { StatusCodes } from 'http-status-codes'

export const createProduct = async (req, res) => {
  req.body.user = req.user.userId
  const product = await Product.create(req.body)
  res.status(StatusCodes.CREATED).json({ product })
}

export const getProducts = async (req, res) => {
  const products = await Product.find({})
  res.status(StatusCodes.OK).json({ products, count: products.length })
}

export const getProduct = async (req, res) => {
  const product = await Product.findById(req.params.id).populate('reviews')
  if (!product) {
    throw new BadRequestError(`There is no product with id: ${req.params.id}`)
  }
  res.status(StatusCodes.OK).json({ product })
}

export const uploadImage = async (req, res) => {
  const { id } = req.params
  const product = await Product.findById(id)

  if (!product) {
    throw new BadRequestError(`There is no product with id: ${id}`)
  }

  if (!req.files) {
    throw new CustomError.BadRequestError('No File Uploaded')
  }
  const productImage = req.files.image
  if (!productImage.mimetype.startsWith('image')) {
    throw new CustomError.BadRequestError('Please Upload Image')
  }
  const maxSize = 1024 * 1024
  if (productImage.size > maxSize) {
    throw new CustomError.BadRequestError(
      'Please upload image smaller than 1MB'
    )
  }
  const result = await cloudinary.uploader.upload(productImage.tempFilePath, {
    use_filename: true,
    folder: 'e-commerce-file-upload'
  })
  fs.unlinkSync(req.files.image.tempFilePath)

  product.image = result.secure_url
  await product.save()
  res.status(StatusCodes.OK).json({ image: { src: result.secure_url } })
}

export const updateProduct = async (req, res) => {
  const { id: productId } = req.params
  const product = await Product.findByIdAndUpdate(productId, req.body, {
    new: true,
    runValidators: true
  })

  if (!product) {
    throw new BadRequestError(`There is no product with id: ${req.params.id}`)
  }

  res.status(StatusCodes.OK).json({ product })
}

export const deleteProduct = async (req, res) => {
  const { id: productId } = req.params

  const product = await Product.findByIdAndRemove(productId)
  if (!product) {
    throw new BadRequestError(`There is no product with id: ${req.params.id}`)
  }

  res.status(StatusCodes.OK).json({ msg: 'Success! Product removed.' })
}
