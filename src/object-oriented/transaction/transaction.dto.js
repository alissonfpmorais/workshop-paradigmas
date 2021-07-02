class TransactionDto {
  constructor(parser, userId, amount) {
    this.userId = userId;
    this.amountInCents = parser.parseAmount(amount);
  }
}

module.exports = TransactionDto;