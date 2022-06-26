const nodemailer = require("nodemailer");

export default function handler(req, res) {
  const { url, text, title, subjects, message} = req.body;
  // async..await is not allowed in global scope, must use a wrapper
  async function sendmail() {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.USER_GMAIL, // generated ethereal user
      pass: process.env.USER_GMAIL_PASSWORD, // generated ethereal password
    },
    secure: true,
  });
  
  console.log({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.USER_GMAIL, // generated ethereal user
      pass: process.env.USER_GMAIL_PASSWORD, // generated ethereal password
    },
    secure: true,
  })


  // send mail with defined transport object
  await transporter.sendMail({
    from: process.env.USER_GMAIL, // sender address
    to: subjects.split(",").toString(), // list of receivers
    subject: title, // Subject line    
    html: `
    <h1>${title}</h1>
    <div>
    <p style="papadding: 10px 0; font-size: 1.23rem">${message}</p>
    <a href="${url}">
    <button style="padding: 20px 40px; border-radius: 15px; border: none; color: white; background: #338AFF; font-weight: 600; cursor: pointer">
    VER PDF
    </button>
    </a>
    <p style="papadding: 10px 0; font-size: 1rem">${text}</p>
    </div>
    `, // html body
  });

  }
  

  try{
    const email = sendmail();

    if (email.catch(err => err)) {
      console.log(email.catch(err => err));
      throw new Error(email.catch(err => err));
    }

    res.status(200).json({ name: JSON.stringify(email) })
  } catch(err){
    console.log(err)
    res.status(400).json({ error: err.message })
  }
}
