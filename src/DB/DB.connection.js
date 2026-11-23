import mongoose from "mongoose";
export const DBconnetion = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/sarahaApp4-7")
        console.log("conneted successfuly");
        
    } catch (error) {
        console.log("database connection failed");

    }
}

