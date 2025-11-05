export const AUTH_CONSTANTS = {
  TOKEN_EXPIRY: {
    ACCESS_TOKEN: '15m',
    REFRESH_TOKEN: '7d',
  },
  ROLES: {
    ADMIN: 'Admin',
    USER: 'User',
  },
  MESSAGES: {
    SUCCESS: 'Authentication successful',
    BLOCKED_ACCOUNT: 'Your account has been blocked. Please contact support.',
    USER_NOT_FOUND: 'User not found. Please check your credentials.',
    INVALID_MOBILE: 'Please provide a valid mobile number.',
    INVALID_EMAIL: 'Please provide a valid email address.',
    TOKEN_GENERATION_FAILED: 'Failed to generate authentication tokens',
  },
} as const;
