import mongoose from 'mongoose'; // Importing mongoose for MongoDB interactions

const projectSchema = new mongoose.Schema({
    name:{
        type: String,
        lowercase: true,
        required: true,
        trim: true,
        unique: [true, 'Project name already exists'], // Ensuring project names are unique
    },

    // users is array of user ids and it tells no of users involved in the project 
    users: [
        {
            type: mongoose.Schema.Types.ObjectId, // 
            ref: 'user' // Reference to the User model
        }
    ],
    fileTree:{
        type:Object,
        default:{}
    },
})


const Project = mongoose.model('project', projectSchema); // Creating the Project model

export default Project; // Exporting the Project model for use in other parts of the application