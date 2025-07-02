import express from 'express';
import authRoutes from './modules/auth/routes.ts';
import formRoutes from './modules/forms/routes.ts';
import responseRoutes from './modules/response/routes.ts';
import templatesRoute from './modules/templates/routes.ts';
import { CLIENT_URL, PORT } from './configs/env.config.ts';
import cors from 'cors';
import prisma from './configs/db.config.ts';
import cookieParser from 'cookie-parser';
import { apiLogger } from './utils/logger.middleware.ts';

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
app.use(apiLogger);

app.use('/auth', authRoutes);
app.use('/forms', formRoutes);
app.use('/responses', responseRoutes);
app.use('/templates', templatesRoute);

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
