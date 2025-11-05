import { IAdminController } from '../../controller/interfaces/i-admin-controller';
import { IRegistrationController } from '../../controller/interfaces/i-register-controller';

type Handlers = {
  registrationController: IRegistrationController;
  adminController: IAdminController;
};

/**
 * Returns a plain object that maps rpc names -> handler functions.
 * Each handler here is the controller method bound to its instance,
 */
export function createUserHandlers(controllers: Handlers) {
  const { registrationController, adminController } = controllers;

  return {};
}
