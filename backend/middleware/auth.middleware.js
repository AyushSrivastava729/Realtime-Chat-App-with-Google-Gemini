import jwt from "jsonwebtoken"; // to use jsonwebtoken for verifying JWT tokens
import redisClient from "../services/redis.service.js"; //importing the redis client

export const authUser = async (req, res, next) => {
    try {
     const token = req.cookies.token 
    || (req.headers.authorization && req.headers.authorization.split(" ")[1]);

        if (!token) {
            return res.status(401).json({ error: 'Unauthorized User' }); //if token is not provided, return 401 unauthorized error
        }

        const isBlacklisted = await redisClient.get(token); //checking if the token is blacklisted

        if (isBlacklisted) {

            res.cookie('token', ''); //clearing the token cookie

            return res.status(401).json({ error: 'Unauthorized User' }); //if token is blacklisted, return 401 unauthorized error
        }



        const decoded = jwt.verify(token, process.env.JWT_SECRET); //verifying the token with the secret key

        req.user = decoded; //adding the decoded user information to the request.user

        next(); //calling the next middleware or route handler

    } catch (error) {

        console.log(error);


        res.status(401).json({ error: 'Unauthorized User' }); //if token is invalid or not provided, return 401 unauthorized error
    }
}