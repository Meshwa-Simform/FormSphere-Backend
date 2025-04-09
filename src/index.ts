import express from 'express';
import authRoutes from './modules/auth/routes';
import { CLIENT_URL, PORT } from './configs/env.config';
import cors from 'cors';
import prisma from './configs/db.config';
import cookieParser from 'cookie-parser';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: CLIENT_URL, // Allow requests from your frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Allow cookies to be sent
  }),
);
app.use(cookieParser());

app.use('/auth', authRoutes);

// Start the server
const SERVER_PORT = PORT;
app.listen(SERVER_PORT, async () => {
  try {
    await prisma.$connect(); // Connect to the database
    console.log('Connected to the database');
    console.log('Server is running');
  } catch (error) {
    console.error('Error connecting to the database:', error);
    process.exit(1); // Exit the process if the database connection fails
  }
});
