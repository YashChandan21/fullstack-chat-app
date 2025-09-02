import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email:{
            type: String,
            required: true,
            unique: true,
        },
        fullName:{
            type: String,
            required: true,
        },
        password:{
            type: String,
            required: function() {
                return !this.firebaseUid; // Password not required for Firebase users
            },
            minlength:6,
        },
        profilePic:{
            type: String,
            default: "",
        },
        firebaseUid: {
            type: String,
            unique: true,
            sparse: true, // Allows null values
        },
    },
    {timestamps: true}
);

const User = mongoose.model("User", userSchema);

export default User;
