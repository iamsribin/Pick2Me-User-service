import { Container } from 'inversify';
import 'reflect-metadata';

// implementations
import { UserRepository } from '../repositories/implementation/user-repo';
import { AdminRepository } from '../repositories/implementation/admin-repo';

import { UserService } from '../services/implementation/user-service';
import { RegistrationService } from '../services/implementation/registration-service';
import { AdminService } from '../services/implementation/admin-service';

import { UserController } from '../controller/implementation/user-controller';
import { RegistrationController } from '../controller/implementation/registration-controller';
import { AdminController } from '../controller/implementation/admin-controller';

import { IUserRepository } from '../repositories/interface/i-user-repository';
import { IAdminRepository } from '../repositories/interface/i-admin-repository';
import { TYPES } from '../types/container-type';

export const container = new Container();

// Repositories - singletons
container.bind<IUserRepository>(TYPES.UserRepository).to(UserRepository).inSingletonScope();
container.bind<IAdminRepository>(TYPES.AdminRepository).to(AdminRepository).inSingletonScope();

// Services - singletons are fine for stateless services
container.bind(TYPES.UserService).to(UserService).inSingletonScope();
container.bind(TYPES.RegistrationService).to(RegistrationService).inSingletonScope();
container.bind(TYPES.AdminService).to(AdminService).inSingletonScope();

// Controllers
container.bind(TYPES.UserController).to(UserController).inSingletonScope();
container.bind(TYPES.RegistrationController).to(RegistrationController).inSingletonScope();
container.bind(TYPES.AdminController).to(AdminController).inSingletonScope();

export default container;
