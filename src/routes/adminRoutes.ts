import express from 'express';
import container from '../config/inversify.config';
import { TYPES } from '../inversify/types';
import { catchAsync } from '@retro-routes/shared';
import { AdminController } from '../controller/implementation/admin-controller';

const adminUserController = container.get<AdminController>(TYPES.AdminController);

const adminRoute = express.Router();

adminRoute.get('/getActiveUserData', catchAsync(adminUserController.getUsersList));
adminRoute.get('/blockedUserData', adminUserController.getUsersList);
adminRoute.get('/userData', adminUserController.getUserData);
adminRoute.patch('/updateUserStatus', adminUserController.updateUserStatus);
