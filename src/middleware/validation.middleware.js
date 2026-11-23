import { errorres } from "../utils/error.res.js"




export const validation = (schema) => {
    return (req, res, next) => {
        const validationError = []
        Object.keys(schema).map(ele => {
            const validationres = schema[ele].safeParse(req[ele])
            console.log(ele, validationres.error?.issues)
            if (!validationres.success) {
                validationError.push(validationres.error.issues)
            }
        })
        if (validationError.length) {
           return  errorres({
                msg: "validationres error",
                statusCode: 400,
                options: validationError
            })
        }
        next()
    }
}


