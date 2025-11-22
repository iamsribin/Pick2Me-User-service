import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();

import app from '@/app';
import { createRedisService } from '@Pick2Me/shared/redis';
import { startGrpcServer } from '@/grpc/server';
import { connectSQL } from '@/config/sql-database';
import { isEnvDefined } from '@/utils/envChecker';

const startServer = async () => {
  try {
    isEnvDefined();

    connectSQL();

    startGrpcServer();

    createRedisService(process.env.REDIS_URL!);

    app.listen(process.env.PORT, () =>
      console.log(`User service running on port ${process.env.PORT}`)
    );
  } catch (err) {
    console.log(err);
  }
};

startServer();
