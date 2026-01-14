import express from 'express';
import { upload } from '@/middleware/multer';
import container from '@/config/inversify.config';
import { UserController } from '@/controller/user-controller';
import { verifyGatewayJwt } from '@pick2me/shared/auth';
import { TYPES } from '@/types/container-type';
import { catchAsync } from '@pick2me/shared/utils';

const userController = container.get<UserController>(TYPES.UserController);

const userRouter = express.Router();

//  All routes below require a valid user gateway JWT
userRouter.use(verifyGatewayJwt(true, process.env.GATEWAY_SHARED_SECRET!));

userRouter.post(
  'me/upload-chat-file',
  upload.fields([{ name: 'file', maxCount: 1 }]),
  catchAsync(userController.uploadChatFile)
);
userRouter.get('/me', catchAsync(userController.fetchProfile));
userRouter.get('/me/saved-places', catchAsync(userController.fetchSavedPlaces));
userRouter.post('/me/add-saved-place', catchAsync(userController.saveNewPlace));
userRouter.put('/me/avatar', upload.single('avatar'), catchAsync(userController.updateAvatar));
userRouter.put('/me/name', catchAsync(userController.updateName));

export { userRouter };
