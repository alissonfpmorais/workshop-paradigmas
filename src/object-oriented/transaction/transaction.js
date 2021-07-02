class Transaction {
  constructor(id, userId, amountInCents) {
    this.id = id;
    this.userId = userId;
    this.amountInCents = amountInCents;
  }
}

module.exports = Transaction;