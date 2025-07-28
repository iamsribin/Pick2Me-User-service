import path from 'path';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import "dotenv/config";
import { connectSQL } from './config/sql-database';
connectSQL(); 

import {RegistrationController} from './controller/implementation/registration_controller';
import {LoginController} from './controller/implementation/login-controller';
import {AdminController} from './controller/implementation/admin-controller';

import {LoginService} from "./services/implementation/login-service";
import {RegistrationService} from "./services/implementation/registration_service";
import {AdminService} from "./services/implementation/admin-service";
import { AuthService } from "./utilities/auth"

import {UserRepository} from "./repositories/implementation/user-repo";
import {AdminRepository} from "./repositories/implementation/admin-repo";

const userRepo = new UserRepository();
const adminRepo = new AdminRepository();

const authService = new AuthService();
const adminService = new AdminService(adminRepo);
const registrationService = new RegistrationService(userRepo);
const loginService = new LoginService(userRepo, authService);

const adminController = new AdminController(adminService);
const registrationController = new RegistrationController(authService, registrationService); 
const loginController = new LoginController(loginService);

const packageDef = protoLoader.loadSync(path.resolve(__dirname, './proto/user.proto'), {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const grpcObject = grpc.loadPackageDefinition(packageDef) as unknown as any;
const userProto = grpcObject.user_package;

if (!userProto || !userProto.User || !userProto.User.service) {
  console.error("Failed to load the User service from the proto file.");
  process.exit(1);
}
 
const server = new grpc.Server();

server.addService(userProto.User.service, {
  Register: registrationController.signup.bind(registrationController),
  CheckUser: registrationController.checkUser.bind(registrationController),
  ResendOtp: registrationController.resendOtp.bind(registrationController),
  CheckGoogleLoginUser: loginController.checkGoogleLoginUser.bind(loginController),
  CheckLoginUser: loginController.checkLoginUser.bind(loginController),

  AdminGetActiveUser: adminController.getActiveUser.bind(adminController),
  AdminGetBlockedUsers: adminController.getBlockedUsers.bind(adminController),
  AdminGetUserData: adminController.getUserDetails.bind(adminController),
  AdminUpdateUserStatus: adminController.updateUserStatus.bind(adminController),
});

const grpcServer = () => {
  const port = process.env.PORT || '3002';
  const Domain=process.env.NODE_ENV==='dev'?process.env.DEV_DOMAIN:process.env.PRO_DOMAIN_USER
  console.log(Domain);
  server.bindAsync(`${Domain}:${port}`, grpc.ServerCredentials.createInsecure(), (err, bindPort) => {
    if (err) {
      console.error("Error starting gRPC server:", err);
      return;
    }
    console.log(`gRPC user server started on port:${bindPort}`);
  });
};

grpcServer();