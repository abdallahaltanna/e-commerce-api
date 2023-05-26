import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    const connect = await mongoose.connect(process.env.MONGO_URI)
    console.log(
      `Connected to mongoDB through this uri ${connect.connection.host}`
    )
  } catch (error) {
    console.log(error)
  }
}

export default connectDB
