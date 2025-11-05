import express from 'express';
import cookieParser from 'cookie-parser';
import { authRouter } from './routes/authRouter';
import { userRouter } from './routes/userRouter';
import { errorHandler } from '@Pick2Me/shared';

// create app
const app = express();

// middlewares
app.use(express.json());
app.use(cookieParser());

// routes
app.use('/', authRouter);
app.use('/', userRouter);

// error handler
app.use(errorHandler);

// export app
export default app;
