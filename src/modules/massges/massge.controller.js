import { Router } from "express";
import { uploadfile } from "../../utils/multer";
import { sendmassege } from "./massege.services";
import { successres } from "../../utils/success.res";
const router = Router()
export const routes = {
    base: "/massege",
    send: "/send"
}





router.post(routes.send, uploadfile("messages").array("images", 5), async (req, res) => {
    const { content, to } = req.body()
    const images = req.files.map(ele => ele.path)
    const { data } = await sendmassege(content ,images , to )
    successres({
        res, 
        data
    })
})






export default router