import "reflect-metadata";
import "dotenv/config";


import { connectSQL } from "./config/sql-database";
connectSQL();


// Wire up DI container
import container from "./inversify/inversify.config";
import { TYPES } from "./inversify/types";


// resolve controllers from the container
import { RegistrationController } from "./controller/implementation/registration-controller";
import { LoginController } from "./controller/implementation/login-controller";
import { AdminController } from "./controller/implementation/admin-controller";
import {UserController} from "./controller/implementation/user-controller";


const registrationController = container.get<RegistrationController>(TYPES.RegistrationController);
const loginController = container.get<LoginController>(TYPES.LoginController);
const adminController = container.get<AdminController>(TYPES.AdminController);
const userController = container.get<UserController>(TYPES.UserController);


/* --- handlers and server wiring --- */
import { createUserHandlers } from "./grpc/handlers/user-handlers";
import { startGrpcServer } from "./grpc/server";
import { userServiceDescriptor } from "@retro-routes/shared";


if (!userServiceDescriptor) {
console.error("❌ Could not find user service descriptor in shared proto. Aborting.");
process.exit(1);
}


const handlers = createUserHandlers({
registrationController,
loginController,
userController,
adminController,
});


const domain = process.env.NODE_ENV === "dev" ? process.env.DEV_DOMAIN : process.env.PRO_DOMAIN_USER;
const port = process.env.PORT || "3002";
const address = `${domain}:${port}`;


startGrpcServer({ serviceDescriptor: userServiceDescriptor, handlers, address })
.then(() => console.log("Server ready"))
.catch((err) => {
console.error("Failed to start gRPC server", err);
process.exit(1);
});