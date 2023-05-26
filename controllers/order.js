import Order from '../models/order.js'
import Product from '../models/product.js'
import BadRequestError from '../errors/bad-request.js'
import NotFoundError from '../errors/not-found.js'
import { checkPermission } from '../utils/jwt.js'
import { StatusCodes } from 'http-status-codes'

const fakeStripeAPI = async ({ amount, currency }) => {
  const client_secret = 'someRandomValues'
  return { client_secret, amount }
}

export const createOrder = async (req, res) => {
  const { items: cartItems, tax, shippingFee } = req.body
  if (!tax || !shippingFee) {
    throw new BadRequestError('Please provide tax abd shipping fee')
  }

  if (!cartItems || cartItems.length < 1) {
    throw new BadRequestError('No order items provided')
  }

  let orderItems = [],
    subtotal = 0

  for (const item of cartItems) {
    const dbProduct = await Product.findOne({ _id: item.product })
    if (!dbProduct) {
      throw new NotFoundError('There is no product with id: ' + item.product)
    }

    const { name, image, price, _id } = dbProduct
    const singleOrderItem = {
      amount: item.amount,
      name,
      image,
      price,
      product: _id
    }

    orderItems = [...orderItems, singleOrderItem]
    subtotal += item.amount * price
  }
  const total = Number(tax) + Number(shippingFee) + Number(subtotal)
  const paymentIntent = await fakeStripeAPI({
    amount: total,
    currency: 'usd'
  })

  const order = await Order.create({
    tax,
    total,
    subtotal,
    shippingFee,
    orderItems,
    clientSecret: paymentIntent.client_secret,
    user: req.user.userId
  })

  res
    .status(StatusCodes.CREATED)
    .json({ order, clientSecret: order.clientSecret })
}

export const getOrder = async (req, res) => {
  const { id: orderId } = req.params
  const order = await Order.findById(orderId)
  if (!order) {
    throw new NotFoundError(`There is no order with id: ${orderId}`)
  }
  checkPermission(req.user, order.user)
  res.status(StatusCodes.OK).json({ order })
}

export const updateOrder = async (req, res) => {
  const { id: orderId } = req.params
  const { paymentIntentId } = req.body

  const order = await Order.findById(orderId)
  if (!order) {
    throw new NotFoundError(`There is no order with id: ${orderId}`)
  }

  checkPermission(req.user, order.user)

  order.paymentIntentId = paymentIntentId
  order.status = 'paid'
  await order.save()

  res.status(StatusCodes.OK).json({ order })
}

export const getAllOrders = async (req, res) => {
  const orders = await Order.find({})
  res.status(StatusCodes.OK).json({ orders, count: orders.length })
}

export const getUserOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user.userId })
  res.status(StatusCodes.OK).json({ orders })
}
