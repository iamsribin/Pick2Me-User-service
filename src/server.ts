import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();

import app from '@/app';
import { createRedisService } from '@pick2me/shared/redis';
import { startGrpcServer } from '@/grpc/server';
import { connectSQL } from '@/config/sql-database';
import { isEnvDefined } from '@/utils/envChecker';

const startServer = async () => {
  try {
    isEnvDefined();

    connectSQL();

    startGrpcServer();

    createRedisService(process.env.REDIS_URL!);

    const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

    app.listen(PORT, () => {
      console.log(`User service running on port ${PORT}`);
    });
  } catch (err) {
    console.log(err);
  }
};

startServer();
