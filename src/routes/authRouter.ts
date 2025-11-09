import express from 'express';
import { upload } from '../middleware/multer';
import container from '../config/inversify.config';
import { RegistrationController } from '../controller/auth-controller';
import { catchAsync } from '@Pick2Me/shared';
import { TYPES } from '../types/container-type';

const registrationController = container.get<RegistrationController>(TYPES.RegistrationController);

const authRouter = express.Router();

authRouter.post(
  '/register',
  upload.single('userImage'),
  catchAsync(registrationController.register)
);
authRouter.post('/check-registration', catchAsync(registrationController.checkUser));
authRouter.post('/resend-otp', catchAsync(registrationController.resendOtp));
authRouter.post('/check-login-number', catchAsync(registrationController.checkLoginUser));
authRouter.post('/check-login-email', catchAsync(registrationController.checkGoogleLoginUser));
// authRouter.get('/refresh', catchAsync(registrationController.refreshToken));
// authRouter.delete('/logout', catchAsync(registrationController.logout));

export { authRouter };
