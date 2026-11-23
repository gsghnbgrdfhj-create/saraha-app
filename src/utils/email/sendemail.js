
import nodemailer from "nodemailer"

export const sendemail = async ({to , subject, html  }) => {
    const transportar = nodemailer.createTransport({
        auth: {
            user : process.env.USER,
            pass : process.env.PASS
        },
        service: "gmail",
    })

    const info = await transportar.sendMail({
        from: "saraha app <saraha@gmail.com>",
        to ,
        subject ,
        html 
    })

    console.log(info.accepted)
}





