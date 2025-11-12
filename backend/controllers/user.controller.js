import userModel from '../models/user.model.js'; //importing the user model
import * as userService from '../services/user.services.js'; //importing the user services
import { validationResult } from 'express-validator'; // to validate the request body
import redisClient from '../services/redis.service.js'; //importing the redis client

// it is a controller that validates the data with the help of express-validator and calls the service to create a new user

export const createUserController = async (req, res) => {

    const errors = validationResult(req); //checking for validation errors

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() }); //if there are validation errors, return 400 with errors
    }

    try {
        const user = await userService.createUser(req.body); //calling the service to create a new user

        const token = user.generateJWT(); //generating JWT token for the user

        delete user._doc.password; //deleting the password field from the user object before sending it to the client

        res.status(201).json({ user, token }); //if user is created successfully, return 201 with user object
    } catch (error) {
        res.status(400).send(error.message); //if there is an error, return 500 with error message
    }
}

export const loginController = async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { email, password } = req.body;
        console.log('Login attempt:', { email, password });

        const user = await userModel.findOne({ email }).select('+password');
        console.log('User found:', user);

        if (!user) {
            console.log('No user found for email:', email);
            return res.status(401).json({ errors: 'Invalid Credentials' });
        }

        console.log('Stored hashed password:', user.password);
        const isMatch = await user.isValidPassword(password);
        console.log('Password match result:', isMatch);

        if (!isMatch) {
            console.log('Password does not match for user:', email);
            return res.status(401).json({ errors: 'Invalid Credentials' });
        }

        const token = user.generateJWT(); //generating JWT token for the user

        delete user._doc.password; //deleting the password field from the user object before sending it to the client

        res.status(200).json({ user, token });
    } catch (err) {
        console.log('Login error:', err);
        res.status(400).send(err.message);
    }
}

export const profileController = async (req, res) => {
    // Assuming req.user is populated by authentication middleware
    console.log(req.user); // Log the user information from the request
    res.status(200).json({
        user: req.user
    }); // Return the user information
};

export const logoutController = async (req, res) => {
    try {
        const token = req.cookies.token || req.headers.authorization.split(" ")[1]; //getting the token from cookies or authorization header

        redisClient.set(token, 'logout', 'EX', 24 * 60 * 60); //setting the token in redis with expiry time of 24 hours

        res.status(200).json({ message: 'Logged out successfully' }); //if logout is successful, return 200 with message    

    } catch (error) {
        res.status(400).send(error.message);
    }
}

export const getAllUsersController = async (req, res) => {
    try {
        const loggedInUser = await userModel.findOne({
            email: req.user.email
        })

        const allUsers = await userService.getAllusers({ userId: loggedInUser._id })

        return res.status(200).json({
            users: allUsers
        })

    } catch (error) {
        console.log(error)
        res.status(400).json({
            error: error.message
        })

    }
}