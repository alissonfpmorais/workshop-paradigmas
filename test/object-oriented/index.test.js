const { deepEq, doesNotReject, eq, rejects, throws, execute } = require('../utils');
const Account = require('../../src/object-oriented/index');
const Parser = require('../../src/object-oriented/parser');
const UserRepository = require('../../src/object-oriented/user/user.repository');
const TransactionRepository = require('../../src/object-oriented/transaction/transaction.repository');

const tests = [
  testCapitalizeWord,
  testCapitalizeSentence,
  testStringFloatToCents,
  testParseName,
  testParseEmail,
  testParseAmount,
  testCalculateBalance,
  testCreateUser,
  testGetUser,
  testDeposit,
  testWithdraw,
  testGetBalance,
  testTransferAmount,
];

const johnUser = { firstName: 'John', lastName: 'Doe', email: 'john.doe@email.com' };
const janeUser = { firstName: 'Jane', lastName: 'Doe', email: 'jane.doe@email.com' };

function createUser(account, params) {
  return account.createUser(params.firstName, params.lastName, params.email);
}

function testCapitalizeWord({ parser }) {
  eq(parser.capitalizeWord('john'), 'John');
  eq(parser.capitalizeWord(' john   '), 'John');
  eq(parser.capitalizeWord(' joHN   '), 'John');
}

function testCapitalizeSentence({ parser }) {
  eq(parser.capitalizeSentence('john doe'), 'John Doe');
  eq(parser.capitalizeSentence('john DOe'), 'John Doe');
  eq(parser.capitalizeSentence(' JOHn doe   '), 'John Doe');
}

function testStringFloatToCents({ parser }) {
  eq(parser.stringFloatToCents('0.00011'), 0);
  eq(parser.stringFloatToCents('0.011'), 1);
  eq(parser.stringFloatToCents('1'), 100);
  eq(parser.stringFloatToCents('1009'), 100900);
  eq(parser.stringFloatToCents('10.09'), 1009)
  eq(parser.stringFloatToCents('10.099'), 1009);
  eq(parser.stringFloatToCents('number'), NaN);
}

function testParseName({ parser }) {
  throws(() => parser.parseName(1), new Error('Invalid name'));
  throws(() => parser.parseName(''), new Error('Invalid name'));
  throws(() => parser.parseName('a'), new Error('Invalid name'));
  eq(parser.parseName('ab'), 'Ab');
  eq(parser.parseName('john doe'), 'John Doe');
  eq(parser.parseName('john DOe'), 'John Doe');
  eq(parser.parseName(' JOHn doe   '), 'John Doe');
}

function testParseEmail({ parser }) {
  throws(() => parser.parseEmail(1), new Error('Invalid email'));
  throws(() => parser.parseEmail('any text'), new Error('Invalid email'));
  eq(parser.parseEmail('john.doe@email.com'), 'john.doe@email.com');
  eq(parser.parseEmail('john.doe@Email.com   '), 'john.doe@email.com');
}

function testParseAmount({ parser }) {
  throws(() => parser.parseAmount(1), new Error('Invalid amount'));
  throws(() => parser.parseAmount('number'), new Error('Invalid amount'));
  eq(parser.parseAmount('0.00011'), 0);
  eq(parser.parseAmount('0.011'), 1);
  eq(parser.parseAmount('1'), 100);
  eq(parser.parseAmount('1009'), 100900);
  eq(parser.parseAmount('10.09'), 1009)
  eq(parser.parseAmount('10.099'), 1009);
  eq(parser.parseAmount('-10.099'), -1009);
}

function testCalculateBalance({ account }) {
  const transaction = { amountInCents: 100 };
  const transaction2 = { amountInCents: 101 };
  const transaction3 = { amountInCents: -102 };
  eq(account.calculateBalance([transaction, transaction2]), 201);
  eq(account.calculateBalance([transaction, transaction2, transaction3]), 99);
}

async function testCreateUser({ account, parser }) {
  rejects(createUser(account, { ...johnUser, firstName: 1 }), Error('Invalid first name'));
  rejects(createUser(account, { ...johnUser, lastName: 1 }), Error('Invalid last name'));
  rejects(createUser(account, { ...johnUser, email: 'email' }), Error('Invalid email'));

  const user = await createUser(account, johnUser);
  eq(user.id, 1);
  eq(user.firstName, parser.capitalizeWord(johnUser.firstName));
  eq(user.lastName, parser.capitalizeWord(johnUser.lastName));
  eq(user.email, johnUser.email);
}

async function testGetUser({ account }) {
  rejects(account.getUser(100), Error('User not found'));

  const user = await createUser(account, johnUser);
  const obtainedUser = await account.getUser(user.id);
  eq(obtainedUser.id, user.id);
}

async function testDeposit({ account }) {
  rejects(account.deposit(100, '1'), Error('User not found'));

  const user = await createUser(account, johnUser);
  rejects(account.deposit(user.id, 100), Error('Invalid amount'));
  rejects(account.deposit(user.id, 'number'), Error('Invalid amount'));
  doesNotReject(account.deposit(user.id, '0.00011'), Error('User not found'));
  doesNotReject(account.deposit(user.id, '0.011'), Error('User not found'));
  doesNotReject(account.deposit(user.id, '1'), Error('User not found'));
  doesNotReject(account.deposit(user.id, '1009'), Error('User not found'));
  doesNotReject(account.deposit(user.id, '10.09'), Error('User not found'));

  const transaction = await account.deposit(user.id, '10.099');
  eq(transaction.id, 6);
  eq(transaction.userId, 1);
  eq(transaction.amountInCents, 1009);
}

async function testWithdraw({ account }) {
  const user = await createUser(account, johnUser);
  const transaction = await account.withdraw(user.id, '10.099');
  eq(transaction.id, 1);
  eq(transaction.userId, 1);
  eq(transaction.amountInCents, -1009);
}

async function testGetBalance({ account }) {
  const amount = '10.5';
  const amount2 = '56.8';
  const amount3 = '2.3';
  const john = await createUser(account, johnUser);
  const johnTransaction = await account.deposit(john.id, amount);
  const johnTransaction2 = await account.deposit(john.id, amount2);
  const johnTransaction3 = await account.withdraw(john.id, amount3);
  const balance = await account.getBalance(john.id);

  deepEq(balance, { balance: johnTransaction.amountInCents + johnTransaction2.amountInCents + johnTransaction3.amountInCents });
}

async function testTransferAmount({ account }) {
  const amount = '10.5';
  const amount2 = '56.8';
  const amount3 = '2.3';
  const john = await createUser(account, johnUser);
  const jane = await createUser(account, janeUser);
  const johnTransaction = await account.deposit(john.id, amount);
  const janeTransaction = await account.deposit(jane.id, amount2);
  const johnBalance = await account.getBalance(john.id);
  const janeBalance = await account.getBalance(jane.id);
  deepEq(johnBalance, { balance: johnTransaction.amountInCents });
  deepEq(janeBalance, { balance: janeTransaction.amountInCents });

  const transference = await account.transferAmount(john.id, jane.id, amount3);
  const johnBalance2 = await account.getBalance(john.id);
  const janeBalance2 = await account.getBalance(jane.id);
  deepEq(johnBalance2, { balance: johnBalance.balance - transference.amountInCents});
  deepEq(janeBalance2, { balance: janeBalance.balance + transference.amountInCents });
}

function beforeEach() {
  const parser = new Parser();
  const userRepository = new UserRepository();
  const transactionRepository = new TransactionRepository();
  const account = new Account(parser, userRepository, transactionRepository);
  return { account, parser };
}

execute(tests, beforeEach).finally();