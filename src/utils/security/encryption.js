import crypto from "node:crypto"
import { errorres } from "../error.res.js"


const secretkey = Buffer.from("loikjuyhtgfredwsaqzxcvbnmkiujkiu")
export const encryption = (data) => {
    const iv = crypto.randomBytes(16)  // salt
    const cipher = crypto.createCipheriv("aes-256-cbc", secretkey, iv)
    let ciphertext = cipher.update(data, "utf8", "hex")
    ciphertext += cipher.final("hex")
    return `${iv.toString("hex")}: ${ciphertext} `
}



export const decryption = (encryptedvalue) => {
    const [iv, ciphertext] = encryptedvalue.split(":")
    if (!iv || !ciphertext) {
        errorres({
            msg: "in-valid encrypted value"
        })
    }
    const binaryIv = Buffer.from(iv, "hex")
    const decipher = crypto.createDecipheriv("aes-256-cbc", secretkey, binaryIv)
    let plaintext = decipher.update(ciphertext, "hex", "utf8")
    plaintext += decipher.final("utf8")
    return plaintext
}

