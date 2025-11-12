import { EXCHANGES, RabbitMQ, ROUTING_KEYS, UserRegisteredEvent } from "@Pick2Me/shared";

const url = process.env.RABBIT_URL!;

export class UserEventProducer {
  static async publishUserCreatedEvent(user: UserRegisteredEvent) {
    await RabbitMQ.connect({ url, serviceName: "user-service" });
    await RabbitMQ.publish(EXCHANGES.USER, ROUTING_KEYS.USER_WALLET_CREATE, user);
    console.log(`[UserService] 📤 Published wallet.created → ${user.userId}`);
  }
}
