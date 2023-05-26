import { StatusCodes } from 'http-status-codes'
import User from '../models/user.js'
import BadRequestError from '../errors/bad-request.js'
import UnauthenticatedError from '../errors/unauthenticated.js'
import { attachCookiesToResponse, createTokenUser } from '../utils/jwt.js'
import crypto from 'crypto'
import sendVerificationEmail from '../utils/email/sendVerificationEmail.js'
import Token from '../models/token.js'
import hashString from '../utils/createHash.js'
import sendResetPasswordEmail from '../utils/email/sendResetPasswordEmail.js'

export const register = async (req, res) => {
  const { name, email, password } = req.body
  const emailAlreadyExists = await User.findOne({ email })
  if (emailAlreadyExists) {
    throw new BadRequestError('Email already exists!')
  }

  const firstAccount = (await User.countDocuments({})) === 0
  const role = firstAccount ? 'admin' : 'user'

  const verificationToken = crypto.randomBytes(40).toString('hex')

  const user = await User.create({
    name,
    email,
    password,
    role,
    verificationToken
  })

  const origin = 'http://localhost:3000'

  await sendVerificationEmail({
    name: user.name,
    email: user.email,
    origin,
    verificationToken: user.verificationToken
  })

  res
    .status(StatusCodes.CREATED)
    .json({ msg: 'Success!, Please check your email to verify account' })
}

export const login = async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    throw new BadRequestError('Please provide all values')
  }

  const user = await User.findOne({ email })
  if (!user) {
    throw new UnauthenticatedError('Invalid credentials')
  }

  const isCorrentPassword = await user.comparePassword(password)
  if (!isCorrentPassword) {
    throw new UnauthenticatedError('Invalid credentials')
  }
  if (!user.isVerified) {
    throw new UnauthenticatedError('Please verify your email')
  }

  const tokenUser = createTokenUser(user)

  let refreshToken = ''
  const existingToken = await Token.findOne({ user: user._id })

  if (existingToken) {
    if (!existingToken.isValid) {
      throw new CustomError.UnauthenticatedError('Invalid Credentials')
    }

    refreshToken = existingToken.refreshToken
    attachCookiesToResponse({ res, user: tokenUser, refreshToken })
    res.status(StatusCodes.OK).json({ user: tokenUser })
    return
  }

  refreshToken = crypto.randomBytes(40).toString('hex')
  const userAgent = req.headers['user-agent']
  const ip = req.ip
  const userToken = { userAgent, ip, refreshToken, user: user._id }

  await Token.create(userToken)

  attachCookiesToResponse({ res, user: tokenUser, refreshToken })
  res.status(StatusCodes.OK).json({ user: tokenUser })
}

export const logout = async (_, res) => {
  res.cookie('token', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now() + 1000)
  })
  res.status(StatusCodes.OK).json({ msg: 'User logged out!' })
}

export const verifyEmail = async (req, res) => {
  const { verificationToken, email } = req.body
  const user = await User.findOne({ email })

  if (!user) {
    throw new UnauthenticatedError('Verification failed')
  }

  if (user.verificationToken !== verificationToken) {
    throw new UnauthenticatedError('Verification failed')
  }

  user.isVerified = true
  user.verified = Date.now()
  user.verificationToken = ''

  await user.save()
  res.status(StatusCodes.OK).json({ msg: 'Email verified' })
}

export const forgetPassword = async (req, res) => {
  const { email } = req.body
  if (!email) {
    throw new BadRequestError('Please provide email address')
  }

  const user = await User.findOne({ email })
  if (user) {
    const passwordToken = crypto.randomBytes(70).toString('hex')

    const origin = 'http://localhost:3000'
    await sendResetPasswordEmail({
      name: user.name,
      email: user.email,
      origin,
      token: passwordToken
    })

    const tenMiutes = 1000 * 60 * 10
    const passwordTokenExpirationDate = new Date(Date.now() + tenMiutes)

    user.passwordToken = hashString(passwordToken)
    user.passwordTokenExpirationDate = passwordTokenExpirationDate

    await user.save()
  }

  res
    .status(StatusCodes.OK)
    .json({ msg: 'Please check your email for reset password link' })
}

export const resetPassword = async (req, res) => {
  const { token, email, password } = req.body

  if (!token || !email || !password) {
    throw new CustomError.BadRequestError('Please provide all values')
  }
  const user = await User.findOne({ email })
  const currentDate = new Date()

  if (!user) {
    throw new BadRequestError('Please provide a valid email')
  }

  if (
    user.passwordToken === token &&
    user.passwordTokenExpirationDate > currentDate
  ) {
    user.password = password
    user.passwordToken = ''
    user.passwordTokenExpirationDate = ''
    await user.save()
  } else if (
    user.passwordToken !== token &&
    user.passwordTokenExpirationDate < currentDate
  ) {
    throw new BadRequestError('Password token expiration date time is finished')
  }

  res.status(StatusCodes.OK).json({ msg: 'Password is reseted' })
}
