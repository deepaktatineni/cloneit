import nodemailer from 'nodemailer'

export async function sendEmail(to: string, html: string) {

  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'rllhk3kqcsmyaxcr@ethereal.email', // generated ethereal user
      pass: 'tqFJR2hA1R2QK6t5Nw', // generated ethereal password
    },
  })

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Fred Foo 👻" <foo@example.com>', // sender address
    to, // list of receivers
    subject: "Hello ✔", // Subject line
    html, // plain text body
  })
  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}
