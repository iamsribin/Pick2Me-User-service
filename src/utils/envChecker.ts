import { envChecker } from '@Pick2Me/shared';

export const isEnvDefined = () => {
  envChecker(process.env.PORT, 'PORT');
  envChecker(process.env.NODE_ENV, 'NODE_ENV');
  envChecker(process.env.DEV_DOMAIN, 'DEV_DOMAIN');
  envChecker(process.env.SQL_HOST, 'SQL_HOST');
  envChecker(process.env.SQL_PORT, 'SQL_PORT');
  envChecker(process.env.SQL_USER, 'SQL_USER');
  envChecker(process.env.SQL_PASSWORD, 'SQL_PASSWORD');

  envChecker(process.env.NODEMAILER_USER, 'NODEMAILER_USER');
  envChecker(process.env.NODEMAILER_PASS, 'CLOUDINARY_API_KEY');
};
