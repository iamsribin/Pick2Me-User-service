import express from 'express';

import { upload } from '../middleware/multer';
import container from '../config/inversify.config';
import { UserController } from '../controller/implementation/user-controller';
import { catchAsync, verifyGatewayJwt } from '@Pick2Me/shared';
import { TYPES } from '../types/container-type';

const userController = container.get<UserController>(TYPES.UserController);

const userRouter = express.Router();

//  All routes below require a valid gateway JWT
userRouter.use(verifyGatewayJwt(true, process.env.GATEWAY_SHARED_SECRET!));

userRouter.post(
  '/uploadChatFile',
  upload.fields([{ name: 'file', maxCount: 1 }]),
  catchAsync(userController.uploadChatFile)
);
userRouter.get('/get-my-profile', catchAsync(userController.fetchUserProfile));

export { userRouter };
