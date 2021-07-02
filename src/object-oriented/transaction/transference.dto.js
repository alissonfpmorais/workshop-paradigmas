class TransferenceDto {
  constructor(fromTransactionDto, toTransactionDto) {
    this.fromTransactionDto = fromTransactionDto;
    this.toTransactionDto = toTransactionDto;

    if (toTransactionDto.amountInCents !== fromTransactionDto.amountInCents * -1) throw new Error('Transference amount are not the same');
    this.amountInCents = toTransactionDto.amountInCents;
  }
}

module.exports = TransferenceDto;