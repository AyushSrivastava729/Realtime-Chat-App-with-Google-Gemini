import { Router } from 'express'; // Importing the Router from express
import { body } from 'express-validator'; // Importing body from express-validator for request body validation
import * as projectController from '../controllers/project.controller.js'; // Importing the project controllers
import * as authMiddleware from '../middleware/auth.middleware.js'; // Importing authentication middleware 

const router = Router();

router.post('/create',
    authMiddleware.authUser, // Middleware to access only by authenticated users
    body('name').isString().withMessage('Name is required'), // Validating that name is a string and is required
    projectController.createProjectController // Controller to handle project creation
)

// now we have to create two endpoints-jis bhi project meh apna user present hoga woh saare project return ho jayeee
// second- ek particular user ko kisi ek specific project meh add kar sake

router.get('/all',
    authMiddleware.authUser,
    projectController.getAllProject
)

router.put('/add-user',
    authMiddleware.authUser,
    body('projectId').isString().withMessage('Project ID is required'),
    body('users').isArray({ min: 1 }).withMessage('Users must be a array of strings').bail()
        .custom((users) => users.every(user => typeof user === 'string')).withMessage('Each user must be a string'),
    projectController.addUserToProject
)

router.get('/get-project/:projectId',
    authMiddleware.authUser,
    projectController.getProjectById
)

router.put('/update-file-tree',
    authMiddleware.authUser,
    body('projectId').isString().withMessage('Project ID is required'),
    body('fileTree').isObject().withMessage('File tree is required'),
    projectController.updateFileTree
)

export default router;