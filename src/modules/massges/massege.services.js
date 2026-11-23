import { massegemodel } from "../../DB/massege.model"
import { usermodel } from "../../DB/user.model"
import { errorres } from "../../utils/error.res"




export const sendmassege= async(content , images , to)=>{
    const user = await usermodel.findById(to)
    if(!user){
        errorres({
            msg:"user not found",
            statusCode:404 
        })
    }
    const massege = await massegemodel.create({
        content , 
        images,
        to
    })

    return{
        data:{
            massege
        }
    }
}