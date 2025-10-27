import { Container } from "inversify";
import "reflect-metadata"; 
import { TYPES } from "./types";


// implementations
import { UserRepository } from "../repositories/implementation/user-repo";
import { AdminRepository } from "../repositories/implementation/admin-repo";


import { UserService } from "../services/implementation/user-service";
import { RegistrationService } from "../services/implementation/registration-service";
import { LoginService } from "../services/implementation/login-service";
import { AdminService } from "../services/implementation/admin-service";


import {UserController} from "../controller/implementation/user-controller";
import { RegistrationController } from "../controller/implementation/registration-controller";
import { LoginController } from "../controller/implementation/login-controller";
import { AdminController } from "../controller/implementation/admin-controller";


import { AuthService } from "../utilities/auth";

import { IUserRepository } from "../repositories/interface/i-user-repository";
import { IAdminRepository } from "../repositories/interface/i-admin-repository";

export const container = new Container();


// Repositories - singletons
container.bind<IUserRepository>(TYPES.UserRepository).to(UserRepository).inSingletonScope();
container.bind<IAdminRepository>(TYPES.AdminRepository).to(AdminRepository).inSingletonScope();


// Utilities
container.bind(TYPES.AuthService).to(AuthService).inSingletonScope();


// Services - singletons are fine for stateless services
container.bind(TYPES.UserService).to(UserService).inSingletonScope();
container.bind(TYPES.RegistrationService).to(RegistrationService).inSingletonScope();
container.bind(TYPES.LoginService).to(LoginService).inSingletonScope();
container.bind(TYPES.AdminService).to(AdminService).inSingletonScope();


// Controllers
container.bind(TYPES.UserController).to(UserController).inSingletonScope();
container.bind(TYPES.RegistrationController).to(RegistrationController).inSingletonScope();
container.bind(TYPES.LoginController).to(LoginController).inSingletonScope();
container.bind(TYPES.AdminController).to(AdminController).inSingletonScope();


export default container;