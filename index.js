import express from "express"
import { DBconnetion } from "./src/DB/DB.connection.js"
import { usermodel } from "./src/DB/user.model.js"
import routerwsrvices from "./src/modules/users/user.controller.js"
import jwt from "jsonwebtoken"
import{config} from "dotenv"
import { customAlphabet, nanoid } from "nanoid"
import chalk from "chalk"
import { sendemail } from "./src/utils/email/sendemail.js"
import { emailTemplate } from "./src/utils/email/emailtmplet.js"
import { redisclient } from "./src/DB/redis.connect.js"
import massegerouter , {routes as massegeroutes} from "./src/modules/massges/massge.controller.js"

config({
    path:"./config/.env"
})
const app = express()

// await redisclient.set("test" , "ahmed")
// const test = await redisclient.get("test")
// console.log({test});


app.use(express.json())

app.use(routerwsrvices)

app.use( massegeroutes.base,massegerouter)

// await sendemail({to: "gsghnbgrdfhj@gmail.com" , subject : "confirm email " , html : emailTemplate({otp : 123456 , subject : "confirm email"})})
app.use("/uploads",express.static("./uploads"))
await DBconnetion()
app.listen(3000 , ()=>{
    console.log("server is running successfuly");
    
})
