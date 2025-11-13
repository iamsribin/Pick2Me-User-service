import { paymentClient } from '../connection';

export async function fetchUserWalletBalanceAndTransactions(userId: string) {
  return new Promise<any>((resolve, reject) => {
    paymentClient.GetUserWalletBalanceAndTransactions(
      { userId },
      (err: Error | null, response: { balance: string; transactions: number }) => {
        if (err) return reject(err);
        resolve(response);
      }
    );
  });
}
