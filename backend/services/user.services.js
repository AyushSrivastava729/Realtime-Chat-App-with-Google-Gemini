import userModel from '../models/user.model.js';


export const createUser = async ({
    email, password
}) => {
    // Basic validation
    if (!email || !password) {
        throw new Error("Email and password are required");
    }
    // Hash the password before storing it
    const hashedPassword = await userModel.hashPassword(password);

    // Create a new user instance
    const user = new userModel({
        email,
        password: hashedPassword //storing the hashed password
    });

    await user.save(); // Save the user to MongoDB
    return user; //returning the user object
}

export const getAllusers = async ({ userId }) => {
    const users = await userModel.find({
        _id: { $ne: userId } // all users will be returned except the logged in user
    })
    return users;

}