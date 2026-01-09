import * as grpc from '@grpc/grpc-js';
import { userServiceDescriptor } from '@pick2me/shared/protos';
import { createUserHandlers } from './handlers/user-handlers';
import container from '@/config/inversify.config';
import { TYPES } from '@/types/container-type';
import { GrpcController } from '@/controller/grpc-controller';

const grpcController = container.get<GrpcController>(TYPES.GrpcController);

if (!userServiceDescriptor) {
  console.error('userServiceDescriptor is missing. Inspect loaded proto package.');
  process.exit(1);
}

const handlers = createUserHandlers({ grpcController });

export const startGrpcServer = () => {
  try {
    const server = new grpc.Server();

    server.addService(userServiceDescriptor, handlers);

    server.bindAsync(
      process.env.USER_GRPC_URL as string,
      grpc.ServerCredentials.createInsecure(),
      (err, port) => {
        if (err) {
          console.error('gRPC server bind error:', err);
          process.exit(1);
        }
        console.log(`gRPC server for user service started on port ${port}`);
      }
    );
  } catch (err) {
    console.log('startGrpcServer err=', err);
  }
};
