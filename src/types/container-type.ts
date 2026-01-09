export const TYPES = {
  // Repositories
  UserRepository: Symbol.for('UserRepository'),
  AdminRepository: Symbol.for('AdminRepository'),

  // Services
  UserService: Symbol.for('UserService'),
  RegistrationService: Symbol.for('RegistrationService'),
  AdminService: Symbol.for('AdminService'),

  // Controllers
  UserController: Symbol.for('UserController'),
  RegistrationController: Symbol.for('RegistrationController'),
  AdminController: Symbol.for('AdminController'),
  GrpcController: Symbol.for('GrpcController'),

  // Utilities
  AuthService: Symbol.for('AuthService'),
};
