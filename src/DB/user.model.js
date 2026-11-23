import { model, Schema } from "mongoose";
import { GenderEnum, ProviderEnum, RoleEnum } from "../modules/users/user.type.js";
import { maxLength, minLength, required } from "zod/mini";

const otpSchema = new Schema({
    code: {
        type: String,
        required: true,
       
    }, expireIn: {
        type: Date,
        default: () => Date.now() + 5 * 60 * 1000
    }
}, {
    _id: false
})
otpSchema.index("expireIn ", {
    expireAfterSeconds: 0
})

const userschema = new Schema(
    {
        fristname: {
            type: String,
            required: true
        },
        lastname: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: function () {
                return this.provider == ProviderEnum.system ? true : false
            }
        },
        phone: {
            type: String,
            required: true

        },
        age: Number,
        profileimage: {
            type: String
        },
        username: {
            type: String,
            unique: true,
            required: function () {
                return this.provider == ProviderEnum.system ? true : false
            }
        },
        gender: {
            type: Number,
            enum: Object.values(GenderEnum)
        },
        provider: {
            type: Number,
            enum: Object.values(ProviderEnum)
        },
        Role: {
            type: Number,
            enum: Object.values(RoleEnum),
            default: RoleEnum.user
        },
        bio: String,
        confirmendAt: {
            type: Date
        },
        blokedAt: {
            type: Date
        },
        // otp: otpSchema


    }, {
    timestamps: true,
    strict: true,
    strictQuery: true,
    optimisticConcurrency: true,
    toJSON: {
        virtuals: true,
        getters: true,
        transform(ret, doc) {
            delete ret.id
            delete ret.password
            return ret
        }
    },
    toObject: {
        virtuals: true,
        getters: true,
        transform(ret, doc) {
            delete ret.id
            return ret
        }
    },
    virtuals: {
        fullname: {
            get() {
                return this.fristname + " " + this.lastname
            },
            set(values) {
                const [fristname, lastname] = values.split(" ")
                if (!fristname || !lastname) {
                    throw new Error("in valid username")
                }
                this.set("fristname", fristname)
                this.set("lastname", lastname)
            }
        }
    }
}

)



export const usermodel = model("User", userschema)