export const REGISTRATION_CONSTANTS = {
  MESSAGES: {
    REGISTRATION_SUCCESS: 'User registered successfully',
    REGISTRATION_FAILED: 'Failed to register user',
    USER_EXISTS: 'User already has an account',
    USER_NOT_REGISTERED: 'User not registered',
    INVALID_OTP: 'Invalid OTP provided',
    INVALID_EMAIL: 'Please provide a valid email address',
    INVALID_MOBILE: 'Please provide a valid mobile number',
    INVALID_NAME: 'Please provide a valid name',
    OTP_SENT_SUCCESS: 'OTP sent successfully',
    OTP_RESENT_SUCCESS: 'OTP resent successfully',
    OTP_GENERATION_FAILED: 'Failed to generate OTP token',
    INTERNAL_ERROR: 'Internal server error occurred',
  },
  VALIDATION: {
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 50,
    PASSWORD_MIN_LENGTH: 8,
    MOBILE_MIN_LENGTH: 10,
    MOBILE_MAX_LENGTH: 15,
  },
} as const;
