import * as grpc from '@grpc/grpc-js';
import { userServiceDescriptor } from '@Pick2Me/shared';
import { createUserHandlers } from './handlers/user-handlers';
import container from '../config/inversify.config';

import { IRegistrationController } from '../controller/interfaces/i-register-controller';
import { IAdminController } from '../controller/interfaces/i-admin-controller';
import { TYPES } from '../types/container-type';

const registrationController = container.get<IRegistrationController>(TYPES.RegistrationController);
const adminController = container.get<IAdminController>(TYPES.AdminController);

if (!userServiceDescriptor) {
  console.error('userServiceDescriptor is missing. Inspect loaded proto package.');
  process.exit(1);
}

const handlers = createUserHandlers({
  registrationController,
  adminController,
});

export const startGrpcServer = () => {
  try {
    const server = new grpc.Server();

    // Regiser user service gRPC functions
    server.addService(userServiceDescriptor, handlers);

    // Bind server
    server.bindAsync(
      process.env.GRPC_URL as string,
      grpc.ServerCredentials.createInsecure(),
      () => {
        console.log(`GRPC server for user service running on port ${process.env.GRPC_URL}`);
      }
    );
  } catch (err) {
    console.log(err);
  }
};
