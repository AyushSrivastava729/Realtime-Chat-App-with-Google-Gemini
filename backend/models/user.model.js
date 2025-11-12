import mongoose from "mongoose"; // to use mongoose for MongoDB interactions
import bcrypt from "bcryptjs"; // to use bcrypt for hashing passwords
import jwt from "jsonwebtoken"; // to use jsonwebtoken for generating JWT tokens

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minLength: [6, "Email must be at least 6 characters long"],
        maxLength: [50, "Email must be at most 50 characters long"],
    },
    password: {
        type: String,
        select: false, //to not return the password field when querying the user
    }
});

userSchema.statics.hashPassword = async function (password) { // function to hash the password
    return await bcrypt.hash(password, 10);
}
userSchema.methods.isValidPassword = async function (password) { // function to compare the password with the hashed password
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateJWT = function () {
    return jwt.sign({ email: this.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }); //signing the token with email and secret key, expires in 24 hours
}

const User = mongoose.model('user', userSchema); // creating the User model
export default User; // exporting the User model