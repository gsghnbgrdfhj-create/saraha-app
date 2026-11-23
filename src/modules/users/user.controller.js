import express from "express"
import { Router } from "express";
import { confirmemail, ForgetPassdSendOtp, googlelogin, loginServices, logout, logoutforalldevices, refreshtoken, resetpassword, resndconfirmemailotp, singupservices } from "./user.services.js";
import { successres } from "../../utils/success.res.js";
import { errorres } from "../../utils/error.res.js";
import jwt from "jsonwebtoken"
import { usermodel } from "../../DB/user.model.js";
import { authh, authorization, decodetoken, tokenenum } from "../../middleware/auth.middleware.js";
import { RoleEnum } from "./user.type.js";
import { singupschema } from "./user.validation.js";
import { validation } from "../../middleware/validation.middleware.js";
import multer from "multer";
import { file } from "zod";
import { uploadfile } from "../../utils/multer.js";

const router = Router()



router.post("/singup", validation(singupschema), async (req, res) => {

    const { data } = await singupservices(req.body)
    return successres({
        res,
        status: 201,
        data
    })
})

router.post("/login", async (req, res) => {
 
    const { identifier, password } = req.body;

    const { data } = await loginServices(identifier, password)

    return successres({
        res,
        status: 201,
        data
    })
})



router.get("/me", authh, authorization(RoleEnum.user, RoleEnum.admin), async (req, res) => {
    const user = req.user
    successres({ res, data: { user } })
})


router.post("/refresh", async (req, res, next) => {

    const auth = req.headers.authorization;
    const data = await refreshtoken(auth)
    return successres({
        res,
        data
    })
});


router.post("/singup/google", async (req, res) => {
    const data = await googlelogin(req.body.idToken)
    successres({ res, data })
})

router.patch("/confirmemail", async (req, res) => {
    const { email, otp } = req.body
    const { data } = await confirmemail(email, otp)
    successres({
        res,
        data
    })
})



router.patch("/ForgerPassword", async (req, res) => {
    const { email } = req.body
    const { data } = await ForgetPassdSendOtp(email)
    return successres({
        res,
        data
    })
})

router.patch("/check", async (req, res) => {
    const { email, otp } = req.body

})
router.patch("/resetpassword", async (req, res) => {
    const { email, password, otp } = req.body
    await resetpassword(email, password, otp)
    return successres({
        res

    })
})

router.get("/uploadfile", authh, uploadfile("users").single("image"), async (req, res) => {
    console.log({
        body: req.body,
        files: req.file
    });
    const user = await usermodel.findById(req.user.user._id)
    user.profileImage = req.file.path
    await user.save()
    return res.json({
        msg: "Image uploaded successfully",
        data: req.file
    })
})



router.post("/resendconfirmotp", async (req, res) => {
    const { email } = req.body
    const {data } = await resndconfirmemailotp(email)

    successres({
        res,
        data
    })
})

    router.post("/logoutforalldevices" , authh , async(req,res)=>{
        const userId = req.user._id
        await logoutforalldevices(userId)
       return successres({
            res,
        })
    })

  router.post("/logoutforonedevice" ,authh, async(req,res)=>{
        const userId = req.user._id
        const jti = req.jti
        await logout(userId , jti)
       return successres({
            res,
        })
    })


// router.get("/uploadfile",multer().fields([
//     {name : "images" , maxCount : 2},
//      {name : "coverimages" , maxCount : 5}
// ]) , (req , res)=>{
// console.log({
//     body:req.body,
//     files : req.files
// });

// })



export default router;