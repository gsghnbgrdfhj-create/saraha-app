import { nanoid } from "nanoid"
import { usermodel } from "../../DB/user.model.js"
import { errorres } from "../../utils/error.res.js"
import jwt from "jsonwebtoken"
import { decodetoken, tokenenum } from "../../middleware/auth.middleware.js"
import { compareHash, createhash } from "../../utils/security/hash.js"
import { OAuth2Client } from "google-auth-library"
import { ProviderEnum } from "./user.type.js"
import { random } from "../../utils/email/createotp.js"
import { sendemail } from "../../utils/email/sendemail.js"
import { emailTemplate } from "../../utils/email/emailtmplet.js"
import { assign } from "nodemailer/lib/shared/index.js"
import { attempBlocksCountKey, attempBlocksKey, attempsKey, confirmEmailKey, ResendOtpKey, userPrefixKey, usersessionjwtid, usersessionjwtidprefixkey } from "../../utils/redis.sercices.js"
import { redisclient } from "../../DB/redis.connect.js"
const googleClient = new OAuth2Client()



const calcBlocksec = (count) => {
    const Block_mins_Arr = [5, 15, 60, 300, 1440]
    const index = Math.min(count, Block_mins_Arr)
    return Block_mins_Arr[index - 1] * 60
}
export const singupservices = async ({ fullname, email, password, gender, phone, age, bio, username }) => {
    const isExist = await usermodel.findOne({
        $or: [
            { email },
            { username }
        ]
    })
    if (isExist) {
        errorres({
            msg: `${isExist.email == email ? "email" : "username"} already exist`,
            statusCode: 400
        })
    }

    const otp = random(6)
    await sendemail({
        to: email,
        subject: "confirm email",
        html: emailTemplate({ otp, subject: "confirm email" })
    })

    const user = await usermodel.create({
        fullname,
        email,
        password: await createhash(password),
        gender,
        phone,
        age,
        bio,
        username,
        // otp: {
        //     code: otp
        // }
    })

    const rediskey = confirmEmailKey(user._id)
    await redisclient.set(rediskey, await createhash(otp), {
        expiration: {
            type: "EX",
            value: 5 * 60
        }
    })
    await redisclient.set(ResendOtpKey(user._id), 0, {
        expiration: {
            type: "EX",
            value: 60
        }
    })
    await redisclient.incr(attempsKey(user._id),)
    return {
        data: {
            user
        }
    }
}

export const loginServices = async (identifier, password) => {
    console.log("LOGIN SERVICES STARTED")
    const user = await usermodel.findOne({
        $or: [
            { email: identifier },
            { username: identifier }
        ]
    })

    if (!user) {
        errorres({
            msg: "invalid credentials",
            statusCode: 400
        })
    }
    const ispaasswordhash = await compareHash(password, user.password)
    if (!ispaasswordhash) {
        errorres({
            msg: "invalid credentials",
            statusCode: 400
        })
    }

    const jwtid = nanoid()


    const accesstoken = jwt.sign({
        _id: user.id,
        email: user.email
    }, process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: "30M",
            jwtid
        }
    )
    const Refreshtoken = jwt.sign({
        _id: user.id,
        email: user.email
    }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "7d",
        jwtid
    }
    )

    await redisclient.set(usersessionjwtid(user._id, jwtid), jwtid, {
        expiration: {
            type: "Ex",
            value: 7 * 24 * 60 * 60
        }
    })
    return {
        data: {
            accesstoken,
            Refreshtoken
        }
    }
}


export const refreshtoken = async (auth) => {
    const { user, jti } = await decodetoken({
        auth,
        tokentype: tokenenum.refresh
    })
    const accesstoken = jwt.sign({
        _id: user._id,
        email: user.email
    }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "30m",
        jwtid: jti
    })

    return {
        data: {
            accesstoken
        }
    }
}


export const googlelogin = async (token) => {
    const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID
    })
    const { email, name, picture } = ticket.getPayload()
    const user = await usermodel.findOne(email)
    if (user) {
        if (user.provider != ProviderEnum.google) {
            errorres({
                msg: "use your provider"

            })
        }
        const accesstoken = jwt.sign({
            _id: user.id,
            email: user.email
        }, process.env.ACCESS_TOKEN_SECRET,
            // {
            //     expiresIn: "1m"
            // }
        )
        const Refreshtoken = jwt.sign({
            _id: user.id,
            email: user.email
        }, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: "7d"
        }
        )
        return {
            data: {
                accesstoken,
                Refreshtoken
            }
        }

    }
}


export const resndconfirmemailotp = async (email) => {
    const user = await usermodel.findOne({
        email, confirmendAt: {
            $exists: false
        }
    })

    if (!user) {
        errorres({
            msg: "user not found",
            statusCode: 404
        })

    }

    const canresnd = (await redisclient.get(ResendOtpKey(user._id)) ||
        await redisclient.get(attempBlocksCountKey(user._id)))
    if (!canresnd) {
        errorres({
            msg: "wait",
            statusCode: 404
        })
    }
    const attemps = await redisclient.incr(attempsKey(user._id))
    if (attemps >= 5) {
        const blockcount = await redisclient.incr(attempBlocksCountKey(user._id))
        await redisclient.set(attempBlocksKey(user._id), 0, {
            expiration: {
                type: "EX",
                value: calcBlocksec(blockcount)
            }
        })
        await redisclient.set(attempsKey(user._id), 0)
    } else {

        await redisclient.set(rediskey, await createhash(otp), {
            expiration: {
                type: "EX",
                value: 5 * 60
            }
        })
    }
    const otp = random(6)
    await sendemail({
        to: email,
        subject: "confirm email",
        html: emailTemplate({ otp, subject: "confirm email" })
    })

    const rediskey = confirmEmailKey(user._id)
    await redisclient.set(rediskey, await createhash(otp), {
        expiration: {
            type: "EX",
            value: 5 * 60
        }
    })
    return {
        data: {

        }
    }
}


export const confirmemail = async (email, otp) => {
    const user = await usermodel.findOne({
        email, confirmendAt: {
            $exists: false
        }
    })
    if (!user) {
        errorres({
            msg: "user not found",
            statusCode: 404
        })

    }
    const hashedotp = await redisclient.get(confirmEmailKey(user._id))
    if (!hashedotp) {
        errorres({
            msg: "invalid or expired otp"
        })
    }

    const isBlocked = await redisclient.get(attempBlocksKey(user._id))

    if (isBlocked) {
        const blockedttl = await redisclient.ttl(attempBlocksKey(user._id))
        errorres({
            msg: `try again after ${Math.round(blockedttl / 60)} M`,
            statusCode: 400
        })
    }
    console.log({
    otp,
    hashedotp
})
    const isOtpCorrect = await compareHash(otp, hashedotp)
    if (!isOtpCorrect) {
        const attemps = await redisclient.incr(attempsKey(user._id))
        if (attemps >= 5) {
            const blockcount = await redisclient.incr(attempBlocksCountKey(user._id))
            await redisclient.set(attempBlocksKey(user._id), 0, {
                expiration: {
                    type: "EX",
                    value: calcBlocksec(blockcount)
                }
            })
            await redisclient.set(attempsKey(user._id), 0)

            errorres({
                msg: `try again after ${Math.round(blockcount / 60)}M`
            })
        }
    } else {

        user.confirmendAt = Date.now()
        await user.save()
        const userkeys = await redisclient.keys(userPrefixKey(user._id) + "*")
        await redisclient.del(userkeys)
    }

    return {
        data: {}
    }
}


export const ForgetPassdSendOtp = async (email) => {
    console.log("ForgetPassdSendOtp is working");
    const user = await usermodel.findOne({ email })
    if (!user) {
        errorres({
            msg: "user not found ",
            statusCode: 404
        })
    }

    if (user.otp.expireIn > Date.now()) {
        errorres({
            msg: "try again after 5 minutes",
            statusCode: 400
        })
    }
    const otp = random(6)
    user.otp.code = await createhash(otp)
    user.otp.expireIn = Date.now() + 5 * 60 * 1000
    await user.save()
    await sendemail({
        to: email,
        subject: "forget password",
        html: emailTemplate({
            otp: otp,
            subject: "forget password"
        })
    })
    return {
        data: {}
    }
}

export const resetpassword = async (email, password, otp) => {
    const user = await usermodel.findOne({ email })
    if (!user) {
        errorres({
            msg: "user not found ",
            statusCode: 404
        })
    }
    await checkotp(user, otp)
    user.password = await createhash(password)
    await user.save()

    return {
        data: {}
    }
}



export const checkotp = async (user, otp) => {

    if (!user.otp || user.otp.expireIn < Date.now()) {
        errorres({
            msg: "otp expired",
            statusCode: 404
        })
    }
    const ismatch = await compareHash(otp, user.otp.code)


    if (!ismatch) {
        errorres({
            msg: "in_valid otp",
            statusCode: 404
        })
    }
}



export const logout = async (userId, jti) => {
    const user = await usermodel.findById(userId)
    if (!user) {
        errorres({
            msg: "user not found",
            statusCode: 404
        })
    }
    const deletecount = await redisclient.del(usersessionjwtid(userId, jti))
    if (deletecount < 1) {
        errorres({
            msg: "already logged out"
        })
    }
    return {
        data: {

        }
    }
}



export const logoutforalldevices = async (userId) => {
    const user = await usermodel.findById(userId)
    if (!user) {
        errorres({
            msg: "user not found",
            statusCode: 404
        })
    }
    const sessionkeys = await redisclient.keys(`${usersessionjwtidprefixkey(userId)}:*`)
    const deletecount = await redisclient.del(sessionkeys)
    if (deletecount < 1) {
        errorres({
            msg: "already logged out"
        })
    }
    return {
        data: {

        }
    }
}