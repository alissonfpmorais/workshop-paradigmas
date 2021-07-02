const { deepEq, eq, execute } = require('../utils');
const repository = require('../../src/functional/repository');

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

function createUser(params) {
  return repository.createUser(params.firstName, params.lastName, params.email).run();
}

async function testCreateUser() {
  const { data: user } = await createUser(johnUser);
  eq(user.firstName, johnUser.firstName);
}

async function testGetUser() {
  const { data: noUser } = await repository.getUser(100).run();
  eq(noUser, null);

  const { data: user } = await createUser(johnUser);
  const { data: obtainedUser } = await repository.getUser(user.id).run();
  eq(user.id, obtainedUser.id);
}

async function testCreateTransaction() {
  const amountInCents = 100;
  const { data: john } = await createUser(johnUser);
  const { data: transaction } = await repository.createTransaction(john, amountInCents).run();
  eq(transaction.userId, john.id);
  eq(transaction.amountInCents, amountInCents);
}

async function testGetTransactionById() {
  const amountInCents = 100;
  const { data: john } = await createUser(johnUser);
  const { data: johnTransaction } = await repository.createTransaction(john, amountInCents).run();
  const { data: transaction } = await repository.getTransactionById(johnTransaction.id).run();
  deepEq(johnTransaction, transaction);
}

async function testGetTransactionsFromUser() {
  const amountInCents = 100;
  const amountInCents2 = 101;
  const amountInCents3 = 97;
  const { data: john } = await createUser(johnUser);
  const { data: jane } = await createUser(janeUser);
  const { data: johnTransaction } = await repository.createTransaction(john, amountInCents).run();
  await repository.createTransaction(jane, amountInCents2).run();
  const { data: johnTransaction2 } = await repository.createTransaction(john, amountInCents3).run();
  const { data: johnTransactions } = await repository.getTransactionsFromUser(john).run();
  eq(johnTransactions.length, 2);
  eq(johnTransactions[0].id, johnTransaction.id);
  eq(johnTransactions[0].userId, john.id);
  eq(johnTransactions[0].amountInCents, amountInCents);
  eq(johnTransactions[1].id, johnTransaction2.id);
  eq(johnTransactions[1].userId, john.id);
  eq(johnTransactions[1].amountInCents, amountInCents3);
}

async function testCreateTransference() {
  const amountInCents = 100;
  const { data: john } = await createUser(johnUser);
  const { data: jane } = await createUser(janeUser);
  const { data: transference } = await repository.createTransference(john, jane, 100).run();
  const { data: johnTransaction } = await repository.getTransactionById(transference.fromTransactionId).run();
  const { data: janeTransaction } = await repository.getTransactionById(transference.toTransactionId).run();
  eq(johnTransaction.userId, john.id);
  eq(johnTransaction.amountInCents, amountInCents * -1);
  eq(janeTransaction.userId, jane.id);
  eq(janeTransaction.amountInCents, amountInCents);
}

execute(tests, repository.dropDb).finally();