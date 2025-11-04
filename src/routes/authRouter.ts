import express from "express";

import { upload } from "../middleware/multer";
import container from "../inversify/inversify.config";
import { TYPES } from "../inversify/types";

import { RegistrationController } from "../controller/implementation/registration-controller";
import { catchAsync } from "@retro-routes/shared";

const registrationController = container.get<RegistrationController>(TYPES.RegistrationController);

const authRouter = express.Router();

// Public routes
authRouter.post("/register", upload.single("userImage"), catchAsync(registrationController.register));
authRouter.post("/checkUser", catchAsync(registrationController.checkUser));
authRouter.post("/resendOtp", catchAsync(registrationController.resendOtp));
authRouter.post("/checkLoginUser", catchAsync(registrationController.checkLoginUser));
authRouter.post("/checkGoogleLoginUser", catchAsync(registrationController.checkGoogleLoginUser));
authRouter.post("/refresh", catchAsync(registrationController.refreshToken));
authRouter.delete("/logout", catchAsync(registrationController.logout))

export { authRouter };
