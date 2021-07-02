class Transference {
  constructor(id, fromTransactionId, toTransactionId, amountInCents) {
    this.id = id;
    this.fromTransactionId = fromTransactionId;
    this.toTransactionId = toTransactionId;
    this.amountInCents = amountInCents;
  }
}

module.exports = Transference;