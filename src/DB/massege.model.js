import { model, Schema, Types } from "mongoose";
import { required } from "zod/mini";



const massegeSchema = new Schema(
    {
        content: {
            type: String,
            required: function () {
               return this.images?.length ? false : true
            }
        },
        images: {
            type: [String]
        },
        to:{
            type: Types.ObjectId,
            required:true,
            ref : "user" 
        }
    },
    {
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
        }
    }
)


export const massegemodel = model("massege" , massegeSchema)