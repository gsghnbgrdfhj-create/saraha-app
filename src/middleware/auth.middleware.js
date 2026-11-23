import { ne } from "zod/locales";
import { usermodel } from "../DB/user.model.js";
import { errorres } from "../utils/error.res.js";
import jwt from "jsonwebtoken";
import { redisclient } from "../DB/redis.connect.js";
import { usersessionjwtid } from "../utils/redis.sercices.js";


export const tokenenum ={
    access:"access",
    refresh : "refresh"
}
export const authh =  async (req, res, next) => {
   const {user,jti} = await decodetoken({ auth: req.headers.authorization })
    req.user = user
    req.jti = jti 
    next()
}

export const decodetoken = async({auth, tokentype = tokenenum.access })=>{
  
    console.log(auth);
    if (!auth || !auth.startsWith("Bearer")) {
        errorres({ msg: "in_valid token", statusCode: 401 })
    }
    const token = auth.split(" ")[1]
    console.log(token);
    const paylod = jwt.verify(token,
        tokentype == tokenenum.access?
        process.env.ACCESS_TOKEN_SECRET:
         process.env.REFRESH_TOKEN_SECRET
    )
    console.log(paylod);
    const user = await usermodel.findById(paylod._id)
    console.log({ user });
    if (!user) {
        errorres({
            msg: "user not_found",
            statusCode: 404
        })
    }
    if (!user.confirmendAt) {
        errorres({
            msg:"confirm frist",
            statusCode:404  
        })
    }
    const{jti} = paylod
    if (!jti) {
        errorres({
            msg:"invalid token",
            statusCode:400
        })
    }
    const redisjti =  await redisclient.get(usersessionjwtid(user.id,jti))
    if (!redisjti) {
        errorres({
            msg:"logged out",
            statusCode:400
        })
    }
    return {
        user,
        jti
    }
}




export const authorization = (...role)=>{
return(req , res , next)=>{
    if (!role.includes(req.user.role)) {
        errorres({
            msg : "unauthorization",
            statusCode:401
        })
    }
    next()
}
}