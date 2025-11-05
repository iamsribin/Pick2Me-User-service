import { RegisterUserDataDto } from '../../dto/request/registration-request.dto';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class RegistrationValidation {
  /**
   * Validates mobile number format
   * @param mobile - Mobile number to validate
   * @returns boolean
   */
  static isValidMobile(mobile: string): boolean {
    if (!mobile || typeof mobile !== 'string') return false;

    const cleanMobile = mobile.replace(/\s+/g, '');
    const mobileRegex = /^[0-9]{10,15}$/;

    return mobileRegex.test(cleanMobile);
  }

  /**
   * Validates email format
   * @param email - Email to validate
   * @returns boolean
   */
  static isValidEmail(email: string): boolean {
    if (!email || typeof email !== 'string') return false;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  /**
   * Validates password strength
   * @param password - Password to validate
   * @returns boolean
   */
  static isValidPassword(password: string): boolean {
    if (!password || typeof password !== 'string') return false;

    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  /**
   * Validates name format
   * @param name - Name to validate
   * @returns boolean
   */
  static isValidName(name: string): boolean {
    if (!name || typeof name !== 'string') return false;

    const trimmedName = name.trim();
    return trimmedName.length >= 2 && trimmedName.length <= 50;
  }

  /**
   * Validates complete registration data
   * @param userData - User data to validate
   * @returns ValidationResult
   */
  static validateRegistrationData(userData: RegisterUserDataDto): ValidationResult {
    const errors: string[] = [];

    if (!this.isValidName(userData.name)) {
      errors.push('Name must be between 2-50 characters');
    }

    if (!this.isValidEmail(userData.email)) {
      errors.push('Please provide a valid email address');
    }

    if (!this.isValidMobile(userData.mobile)) {
      errors.push('Please provide a valid mobile number');
    }

    // if (!this.isValidPassword(userData.password)) {
    //   errors.push('Password must be at least 8 characters with uppercase, lowercase, and number');
    // }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
