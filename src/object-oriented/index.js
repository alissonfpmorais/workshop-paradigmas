const UserDto = require('./user/user.dto');
const TransactionDto = require('./transaction/transaction.dto');
const TransferenceDto = require('./transaction/transference.dto');

class Account {
  constructor(parser, userRepository, transactionRepository) {
    this.parser = parser;
    this.userRepository = userRepository;
    this.transactionRepository = transactionRepository;
  }

  calculateBalance(transactions) {
    return transactions.reduce((acc, transaction) => acc + transaction.amountInCents, 0);
  }

  // Comentar sobre exception disparada antes do retorno de uma promise (tornou a função createUser sync ao inves de async)
  // Comentar sobre async em funções sem await
  // Comentar sobre try/catch com e sem await no retorno
  async createUser(firstName, lastName, email) {
    const userDto = new UserDto(this.parser, firstName, lastName, email);
    return this.userRepository.createUser(userDto);
  }

  async getUser(userId) {
    const id = parseInt(userId)
    const user = await this.userRepository.getUser(id);
    if (!user) throw new Error('User not found');
    return user;
  }

  async deposit(userId, amount) {
    const user = await this.getUser(userId);
    const transactionDto = new TransactionDto(this.parser, user.id, amount);
    return this.transactionRepository.createTransaction(transactionDto);
  }

  async withdraw(userId, amount) {
    return this.deposit(userId, '-' + amount);
  }

  async getBalance(userId) {
    const user = await this.getUser(userId);
    const transactions = await this.transactionRepository.getTransactionsFromUser(user);
    return { balance: this.calculateBalance(transactions) };
  }

  async transferAmount(fromUserId, toUserId, amount) {
    const fromUser = await this.getUser(fromUserId);
    const toUser = await this.getUser(toUserId);
    const fromTransactionDto = new TransactionDto(this.parser, fromUser.id, '-' + amount);
    const toTransactionDto = new TransactionDto(this.parser, toUser.id, amount);
    const transferenceDto = new TransferenceDto(fromTransactionDto, toTransactionDto);
    return this.transactionRepository.createTransference(transferenceDto);
  }
}

module.exports = Account;