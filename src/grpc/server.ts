import * as grpc from "@grpc/grpc-js";

export async function startGrpcServer(options: {
  serviceDescriptor: grpc.ServiceDefinition<grpc.UntypedServiceImplementation>;
  handlers: grpc.UntypedServiceImplementation;
  address: string;
}) {
  const { serviceDescriptor, handlers, address } = options;

  const server = new grpc.Server();

  // register service
  server.addService(serviceDescriptor, handlers);

  // bind and start
await new Promise<void>((resolve, reject) => {
  server.bindAsync(address, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      reject(err);
      return;
    }
    console.log(`✅ gRPC server started on ${address} (bound port ${port})`);
    resolve();
  });
});

  // graceful shutdown helper
  const shutdown = async () =>
    new Promise<void>((resolve) =>
      server.tryShutdown(() => {
        console.log("🔴 gRPC server shut down");
        resolve();
      })
    );

  return { server, shutdown };
}
