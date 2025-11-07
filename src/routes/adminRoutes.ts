import express from 'express';
import container from '../config/inversify.config';
import { AdminController } from '../controller/admin-controller';
import { TYPES } from '../types/container-type';
import { catchAsync, verifyGatewayJwt } from '@Pick2Me/shared';

const adminUserController = container.get<AdminController>(TYPES.AdminController);

export const adminRoute = express.Router();

adminRoute.use(verifyGatewayJwt(true, process.env.GATEWAY_SHARED_SECRET!));

adminRoute.get('/users', catchAsync(adminUserController.getUserList));
adminRoute.get('/userData', adminUserController.getUserData);
adminRoute.patch('/updateUserStatus', adminUserController.updateUserStatus);
