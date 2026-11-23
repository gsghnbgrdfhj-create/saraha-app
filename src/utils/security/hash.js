import { compare, hash } from "bcrypt";



export const createhash = async (password) => {

    const generatedHash = await hash(password, 10)
    
    return generatedHash

}

export const compareHash = async (password, Hashedpassword) => {
    const ismatch = await compare(password, Hashedpassword)
    return ismatch
}