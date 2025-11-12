import { Router } from 'express';
import * as userController from '../controllers/user.controller.js'; //importing the user controller
import { body } from 'express-validator'; // to validate the request body
import * as authMiddleware from '../middleware/auth.middleware.js'; //importing the auth middleware

const router = Router();

router.post('/register',
    body('email').isEmail().withMessage('Email must be a valid email address'), //validating email
    body('password').isLength({ min: 3 }).withMessage('Password must be at least 3 characters long'), //validating password
    userController.createUserController); //route to create a new user

router.post('/login',
    body('email').isEmail().withMessage('Email must be a valid email address'), //validating email
    body('password').isLength({ min: 3 }).withMessage('Password must be at least 3 characters long')
    , userController.loginController); //route to login a user


/*protected route to get user profile and if should be only accessed by logged in users and for that we will create a middleware and middleware
/ will verify the token and if token is valid then only it will allow to access the route otherwise it will return 401 unauthorized error and we will use that middleware here */

router.get('/profile', authMiddleware.authUser, userController.profileController); //route to get user profile

router.get('/logout',authMiddleware.authUser, userController.logoutController); //route to logout a user

router.get('/all',authMiddleware.authUser,userController.getAllUsersController);


export default router;