
import multer, { diskStorage, memoryStorage } from "multer";


export const uploadfile = (dest = "/general") => {

    //   const storage = memoryStorage()

    const storage = diskStorage({
        destination: "./uploads/" + dest,
        filename: (req, file, cb) => {
            const username = req.user.user.username
            const filename = username + "_" +Date.now() +"_"+ file.originalname
            cb(null, filename)
        }
    })


    return multer({
        storage
    })
}