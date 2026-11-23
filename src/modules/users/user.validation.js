import z from "zod"
import { GenderEnum } from "./user.type.js";

export const singupschema = {
    body: z.strictObject({
        fullname: z.string(),
        email: z.email(),
        phone: z.string().min(10).max(14),
        password: z.string(),
        age: z.number().optional(),
        gender: z.enum(GenderEnum),
        username: z.string(),
        bio: z.string().optional(),
        confirmedPassword: z.string()
    }).refine((arg) => arg.password == arg.confirmedPassword, {
        error: "password miss match",
        path: ["password", "confirmedPassword"]
    })
}





