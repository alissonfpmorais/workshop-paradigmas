const { deepEq, eq, execute } = require('../utils');
const Parser = require('../../src/object-oriented/parser');
const UserDto = require('../../src/object-oriented/user/user.dto');
const UserRepository = require('../../src/object-oriented/user/user.repository');
const TransactionDto = require('../../src/object-oriented/transaction/transaction.dto');
const TransactionRepository = require('../../src/object-oriented/transaction/transaction.repository');
const TransferenceDto = require('../../src/object-oriented/transaction/transference.dto');

const parser = new Parser();

const tests = [
  testCreateUser,
  testGetUser,
  testCreateTransaction,
  testGetTransactionById,
  testGetTransactionsFromUser,
  testCreateTransference,
];

const johnUser = { firstName: 'John', lastName: 'Doe', email: 'john.doe@email.com' };
const janeUser = { firstName: 'Jane', lastName: 'Doe', email: 'jane.doe@email.com' };

function createUser(repository, params) {
  const userDto = new UserDto(parser, params.firstName, params.lastName, params.email)
  return repository.createUser(userDto);
}

function createTransaction(repository, user, amount) {
  const transactionDto = new TransactionDto(parser, user.id, amount);
  return repository.createTransaction(transactionDto);
}

async function testCreateUser({ userRepository }) {
  const user = await createUser(userRepository, johnUser);
  eq(user.firstName, johnUser.firstName);
}

async function testGetUser({ userRepository }) {
  eq(await userRepository.getUser(100), null);

  const user = await createUser(userRepository, johnUser);
  const obtainedUser = await userRepository.getUser(user.id);
  eq(user.id, obtainedUser.id);
}

async function testCreateTransaction({ userRepository, transactionRepository }) {
  const john = await createUser(userRepository, johnUser);
  const transaction = await createTransaction(transactionRepository, john, '1.02');
  eq(transaction.userId, john.id);
  eq(transaction.amountInCents, 102);
}

async function testGetTransactionById({ userRepository, transactionRepository }) {
  const john = await createUser(userRepository, johnUser);
  const johnTransaction = await createTransaction(transactionRepository, john, '1.02');
  const transaction = await transactionRepository.getTransactionById(johnTransaction.id);
  deepEq(johnTransaction, transaction);
}

async function testGetTransactionsFromUser({ userRepository, transactionRepository }) {
  const john = await createUser(userRepository, johnUser);
  const jane = await createUser(userRepository, janeUser);
  const johnTransaction = await createTransaction(transactionRepository, john, '1');
  await createTransaction(transactionRepository, jane, '1.01');
  const johnTransaction2 = await createTransaction(transactionRepository, john, '0.97');
  const johnTransactions = await transactionRepository.getTransactionsFromUser(john);
  eq(johnTransactions.length, 2);
  eq(johnTransactions[0].id, johnTransaction.id);
  eq(johnTransactions[0].userId, john.id);
  eq(johnTransactions[0].amountInCents, 100);
  eq(johnTransactions[1].id, johnTransaction2.id);
  eq(johnTransactions[1].userId, john.id);
  eq(johnTransactions[1].amountInCents, 97);
}

async function testCreateTransference({ userRepository, transactionRepository }) {
  const john = await createUser(userRepository, johnUser);
  const jane = await createUser(userRepository, janeUser);
  const johnTransactionDto = new TransactionDto(parser, john.id, '-1');
  const janeTransactionDto = new TransactionDto(parser, jane.id, '1');
  const transferenceDto = new TransferenceDto(johnTransactionDto, janeTransactionDto);
  const transference = await transactionRepository.createTransference(transferenceDto);
  const johnTransaction = await transactionRepository.getTransactionById(transference.fromTransactionId);
  const janeTransaction = await transactionRepository.getTransactionById(transference.toTransactionId);
  eq(johnTransaction.userId, john.id);
  eq(johnTransaction.amountInCents, -100);
  eq(janeTransaction.userId, jane.id);
  eq(janeTransaction.amountInCents, 100);
}

function beforeEach() {
  const userRepository = new UserRepository();
  const transactionRepository = new TransactionRepository();
  return { userRepository, transactionRepository };
}

execute(tests, beforeEach).finally();