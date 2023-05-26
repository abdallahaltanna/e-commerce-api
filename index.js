import express from 'express'
import dotenv from 'dotenv'
import connectDB from './db/connect.js'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import { v2 as cloudinary } from 'cloudinary'
import fileUpload from 'express-fileupload'

// Middlewares
import errorHandler from './middlewares/error-handler.js'
import notFound from './middlewares/not-found.js'

// routes
import authRoutes from './routes/auth.js'
import userRoutes from './routes/user.js'
import productRoutes from './routes/product.js'
import reviewRoutes from './routes/review.js'
import orderRoutes from './routes/order.js'

dotenv.config()
await connectDB()

// cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const app = express()

app.use(express.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser(process.env.JWT_SECRET))
app.use(fileUpload({ useTempFiles: true }))

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/user', userRoutes)
app.use('/api/v1/product', productRoutes)
app.use('/api/v1/review', reviewRoutes)
app.use('/api/v1/order', orderRoutes)

app.use(errorHandler)
app.use(notFound)

const port = process.env.PORT

app.listen(port, () => {
  console.log(`App is listen on ${port}`)
})
