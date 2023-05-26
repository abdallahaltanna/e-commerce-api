import { StatusCodes } from 'http-status-codes'
import User from '../models/user.js'
import BadRequestError from '../errors/bad-request.js'
import NotFoundError from '../errors/not-found.js'
import {
  createTokenUser,
  attachCookiesToResponse,
  checkPermission
} from '../utils/jwt.js'
import UnauthenticatedError from '../errors/unauthenticated.js'

export const getAllUsers = async (req, res) => {
  const users = await User.find({ role: 'user' }).select('-password')
  res.status(StatusCodes.OK).json({ users })
}

export const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user })
}

export const updateUser = async (req, res) => {
  const { name, email } = req.body
  if (!name || !email) {
    throw new BadRequestError('Please provide name and email')
  }

  const user = await User.findOne({ _id: req.user.userId })

  user.name = name
  user.email = email

  await user.save()

  const tokenUser = createTokenUser(user)
  attachCookiesToResponse({ res, user: tokenUser })
  res.status(StatusCodes.OK).json({ user: tokenUser })
}

export const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body
  if (!oldPassword || !newPassword) {
    throw new BadRequestError('Please provide old password & new password')
  }

  const user = await User.findOne({ _id: req.user.userId })
  const isCorrectPassword = await user.comparePassword(oldPassword)
  if (!isCorrectPassword) {
    throw new UnauthenticatedError('Invalid credentials')
  }

  user.password = newPassword
  user.save()
  res.status(StatusCodes.OK).json({ msg: 'Password updated' })
}

export const getSingleUser = async (req, res) => {
  const user = await User.findOne({ _id: req.params.id }).select('-password')
  if (!user) {
    throw new NotFoundError('No user with id: ' + id)
  }
  checkPermission(req.user, user._id)
  res.status(StatusCodes.OK).json({ user })
}
