import nodemailer from 'nodemailer'

const sendEmail = async ({ to, subject, html }) => {
  let transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'sofia14@ethereal.email',
      pass: 'HHVeKpBK1zHX2BFQS1'
    }
  })

  return transporter.sendMail({
    from: 'abdallahmyaltanna@gmail.com',
    to,
    subject,
    html
  })
}

export default sendEmail
