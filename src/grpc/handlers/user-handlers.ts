import { IAdminController } from "../../controller/interfaces/i-admin-controller";
import { ILoginController } from "../../controller/interfaces/i-login-controller";
import { IRegistrationController } from "../../controller/interfaces/i-register-controller";
import { IUserController } from "../../controller/interfaces/i-user-controller";

type Handlers = {
  registrationController: IRegistrationController;
  loginController: ILoginController;
  userController: IUserController;
  adminController: IAdminController;
};

/**
 * Returns a plain object that maps rpc names -> handler functions.
 * Each handler here is the controller method bound to its instance,
 */
export function createUserHandlers(controllers: Handlers) {
  const { registrationController, loginController, userController, adminController } = controllers;

  return {
    // registration handlers
    Register: registrationController.signup.bind(registrationController),
    CheckUser: registrationController.checkUser.bind(registrationController),
    ResendOtp: registrationController.resendOtp.bind(registrationController),

    // login handlers
    CheckGoogleLoginUser: loginController.checkGoogleLoginUser.bind(loginController),
    CheckLoginUser: loginController.checkLoginUser.bind(loginController),

    // user handler 
    fetchUserProfile: userController.fetchUserProfile.bind(userController),

    // admin handlers
    AdminGetUsersList: adminController.getUsersList.bind(adminController),
    AdminGetBlockedUsers: adminController.getBlockedUsers.bind(adminController),
    AdminGetUserData: adminController.getUserDetails.bind(adminController),
    AdminUpdateUserStatus: adminController.updateUserStatus.bind(adminController),
  };
}
