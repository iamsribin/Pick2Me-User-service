import { paymentProto } from '@Pick2Me/shared';
import * as grpc from '@grpc/grpc-js';

const paymentClient = new (paymentProto as any).PaymentService(
  process.env.PAYMENT_GRPC_URL,
  grpc.credentials.createInsecure()
);

export { paymentClient };
