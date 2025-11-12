import express from 'express';
import morgan from 'morgan'; // to find the log details of the request
import connect from './db/db.js'; //importing the connect function to connect to the database
import userRoutes from './routes/user.routes.js'; //importing the user routes
import projectRoutes from './routes/project.routes.js'; //importing the project routes
import aiRoutes from './routes/ai.routes.js'
import cookieParser from 'cookie-parser'; // to parse cookies from the request
import cors from 'cors'; //importing cors to handle cross-origin requests
connect(); //connect to the database

const app = express(); //initialize express app

app.use(cors()); //using cors middleware
app.use(morgan('dev')); //using morgan middleware for logging request details
app.use(express.json()); //middleware to parse JSON request bodies
app.use(express.urlencoded({ extended: true })); //middleware to parse URL-encoded request bodies
app.use(cookieParser()); //using cookie parser middleware to parse cookies

app.use('/users', userRoutes); //using the user routes for /users endpoint
app.use('/projects', projectRoutes); //using the project routes for /projects endpoint
app.use("/ai",aiRoutes)


app.get('/', (req, res) => {
  res.send('Hello, World!');
});

export default app;
// listen the app for use in other files (like server.js) because we are using socket.io and if you create server from http module then it will be easier to integrate socket.io with express 