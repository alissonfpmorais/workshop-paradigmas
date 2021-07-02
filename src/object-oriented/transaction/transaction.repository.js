const Transaction = require('./transaction');
const Transference = require('./transference');

class TransactionRepository {
  constructor() {
    this.database = {
      transactions: [],
      transferences: [],
    };
  }

  async createTransaction(transactionDto) {
    const id = this.database.transactions.length + 1;
    const transaction = { id, userId: transactionDto.userId, amountInCents: transactionDto.amountInCents };
    this.database.transactions.push(transaction);
    return new Transaction(transaction.id, transaction.userId, transaction.amountInCents);
  }

  async getTransactionById(transactionId) {
    const maybeTransaction = this.database.transactions.find((transaction) => transaction.id === transactionId);
    return maybeTransaction
      ? new Transaction(maybeTransaction.id, maybeTransaction.userId, maybeTransaction.amountInCents)
      : null;
  }

  async getTransactionsFromUserId(userId) {
    return this.database
      .transactions
      .filter((transaction) => transaction.userId === userId)
      .map((transaction) => new Transaction(transaction.id, transaction.userId, transaction.amountInCents))
  }

  async getTransactionsFromUser(user) {
    return this.getTransactionsFromUserId(user.id);
  }

  async createTransference(transferenceDto) {
    const id = this.database.transferences.length + 1;
    const fromTransaction = await this.createTransaction(transferenceDto.fromTransactionDto);
    const toTransaction = await this.createTransaction(transferenceDto.toTransactionDto);
    const transference = { id, fromTransactionId: fromTransaction.id, toTransactionId: toTransaction.id, amountInCents: transferenceDto.amountInCents };
    this.database.transferences.push(transference);
    return new Transference(transference.id, transference.fromTransactionId, transference.toTransactionId, transference.amountInCents);
  }
}

module.exports = TransactionRepository;