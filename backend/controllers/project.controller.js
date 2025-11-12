import projectModel from '../models/project.model.js'; // Importing the Project model
import * as projectService from '../services/project.service.js'; // Importing the Project service  
import userModel from '../models/user.model.js'; // Importing the User model
import { validationResult } from 'express-validator'; // To validate the request body

// Controller to handle project creation requests and uses service to create a new project

export const createProjectController = async (req, res) => {

    const errors = validationResult(req); // Checking for validation errors

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() }); // If there are validation errors, return 400 with errors
    }

    try {
        const { name } = req.body; // Extracting project name from request body

        const loggedInUser = await userModel.findOne({ email: req.user.email }); // Finding the logged-in user from the database

        const userId = loggedInUser._id; // Extracting user ID from the logged-in user

        const newProject = await projectService.createProject({ name, userId }); // Calling the service to create a new project

        res.status(201).json(newProject); // If project is created successfully, return 201 with project object

    } catch (error) {
        console.log(error);
        res.status(400).send(error.message); // If there is an error, return 400 with error message
    }
}

export const getAllProject = async (req, res) => {
    try {

        const loggedInUser = await userModel.findOne({
            email: req.user.email // we will get logged in user ie its(ID) with the help of Id we have to do function call(service function)
        })

        const allUserProjects = await projectService.getAllProjectByUserId({
            userId: loggedInUser._id
        })

        return res.status(200).json({
            projects: allUserProjects
        })

    } catch (error) {
        console.log(error)
        res.status(400).json({ error: error.message })
    }

}

export const addUserToProject = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { projectId, users } = req.body

        const loggedInUser = await userModel.findOne({
            email: req.user.email
        })

        const project = await projectService.addUserToProject({
            projectId,
            users,
            userId: loggedInUser._id
        })

        return res.status(200).json({
            project,
        })



    } catch (error) {
        console.log(error)
        res.status(400).json({ error: error.message })
    }

}

export const getProjectById = async (req, res) => {

    const { projectId } = req.params;

    try {
        const project = await projectService.getProjectById({ projectId });
        return res.status(200).json({
            project
        })
        
    } catch (error) {
        console.log(error)
        res.status(400).json({ error: error.message })
    }
}

export const updateFileTree = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {

        const { projectId, fileTree } = req.body;

        const project = await projectService.updateFileTree({
            projectId,
            fileTree
        })

        return res.status(200).json({
            project
        })

    } catch (err) {
        console.log(err)
        res.status(400).json({ error: err.message })
    }

}
