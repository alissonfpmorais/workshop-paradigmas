const { deepEq, eq, rejects, execute } = require('../utils');
const functional = require('../../src/functional');
const repository = require('../../src/functional/repository');
const {IOError} = require("../../src/functional/utils");

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

function createUser(params) {
  return functional.createUser(params.firstName, params.lastName, params.email).run();
}

function testCapitalizeWord() {
  eq(functional.capitalizeWord('john'), 'John');
  eq(functional.capitalizeWord(' john   '), 'John');
  eq(functional.capitalizeWord(' joHN   '), 'John');
}

function testCapitalizeSentence() {
  eq(functional.capitalizeSentence('john doe'), 'John Doe');
  eq(functional.capitalizeSentence('john DOe'), 'John Doe');
  eq(functional.capitalizeSentence(' JOHn doe   '), 'John Doe');
}

function testStringFloatToCents() {
  eq(functional.stringFloatToCents('0.00011'), 0);
  eq(functional.stringFloatToCents('0.011'), 1);
  eq(functional.stringFloatToCents('1'), 100);
  eq(functional.stringFloatToCents('1009'), 100900);
  eq(functional.stringFloatToCents('10.09'), 1009)
  eq(functional.stringFloatToCents('10.099'), 1009);
  eq(functional.stringFloatToCents('number'), NaN);
}

function testParseName() {
  deepEq(functional.parseName(1), { error: 'Invalid name' });
  deepEq(functional.parseName(''), { error: 'Invalid name' });
  deepEq(functional.parseName('a'), { error: 'Invalid name' });
  deepEq(functional.parseName('ab'), { data: 'Ab' });
  deepEq(functional.parseName('john doe'), { data: 'John Doe' });
  deepEq(functional.parseName('john DOe'), { data: 'John Doe' });
  deepEq(functional.parseName(' JOHn doe   '), { data: 'John Doe' });
}

function testParseEmail() {
  deepEq(functional.parseEmail(1), { error: 'Invalid email' });
  deepEq(functional.parseEmail('any text'), { error: 'Invalid email' });
  deepEq(functional.parseEmail('john.doe@email.com'), { data: 'john.doe@email.com' });
  deepEq(functional.parseEmail('john.doe@Email.com   '), { data: 'john.doe@email.com' });
}

function testParseAmount() {
  deepEq(functional.parseAmount(1), { error: 'Invalid amount' });
  deepEq(functional.parseAmount('number'), { error: 'Invalid amount' });
  deepEq(functional.parseAmount('0.00011'), { data: 0 });
  deepEq(functional.parseAmount('0.011'), { data: 1 });
  deepEq(functional.parseAmount('1'), { data: 100 });
  deepEq(functional.parseAmount('1009'), { data: 100900 });
  deepEq(functional.parseAmount('10.09'), { data: 1009 });
  deepEq(functional.parseAmount('10.099'), { data: 1009 });
  deepEq(functional.parseAmount('-10.099'), { data: -1009 });
}

function testCalculateBalance() {
  const transaction = { amountInCents: 100 };
  const transaction2 = { amountInCents: 101 };
  const transaction3 = { amountInCents: -102 };
  eq(functional.calculateBalance([transaction, transaction2]), 201);
  eq(functional.calculateBalance([transaction, transaction2, transaction3]), 99);
}

async function testCreateUser() {
  deepEq(await createUser({ ...johnUser, firstName: 1 }), { error: new IOError('Invalid first name') });
  deepEq(await createUser({ ...johnUser, lastName: 1 }), { error: new IOError('Invalid last name') });
  deepEq(await createUser({ ...johnUser, email: 'email' }), { error: new IOError('Invalid email') });

  const { data: user } = await createUser(johnUser);
  eq(user.id, 1);
  eq(user.firstName, functional.capitalizeWord(johnUser.firstName));
  eq(user.lastName, functional.capitalizeWord(johnUser.lastName));
  eq(user.email, johnUser.email);
}

async function testGetUser() {
  deepEq(await functional.getUser(100).run(), { error: new IOError('User not found') });

  const { data: user } = await createUser(johnUser);
  const { data: obtainedUser } = await functional.getUser(user.id).run();
  eq(obtainedUser.id, user.id);
}

async function testDeposit() {
  deepEq(await functional.deposit(100, 100).run(), { error: new IOError('Invalid amount') });
  deepEq(await functional.deposit(100, 'number').run(), { error: new IOError('Invalid amount') });
  deepEq(await functional.deposit(100, '0.00011').run(), { error: new IOError('User not found') });
  deepEq(await functional.deposit(100, '0.011').run(), { error: new IOError('User not found') });
  deepEq(await functional.deposit(100, '1').run(), { error: new IOError('User not found') });
  deepEq(await functional.deposit(100, '1009').run(), { error: new IOError('User not found') });
  deepEq(await functional.deposit(100, '10.09').run(), { error: new IOError('User not found') });
  deepEq(await functional.deposit(100, '10.099').run(), { error: new IOError('User not found') });

  const { data: user } = await createUser(johnUser);
  const { data: transaction } = await functional.deposit(user.id, '10.099').run();
  eq(transaction.id, 1);
  eq(transaction.userId, 1);
  eq(transaction.amountInCents, 1009);
}

async function testWithdraw() {
  const { data: user } = await createUser(johnUser);
  const { data: transaction } = await functional.withdraw(user.id, '10.099').run();
  eq(transaction.id, 1);
  eq(transaction.userId, 1);
  eq(transaction.amountInCents, -1009);
}

async function testGetBalance() {
  const amount = '10.5';
  const amount2 = '56.8';
  const amount3 = '2.3';
  const { data: john } = await createUser(johnUser);
  const { data: johnTransaction } = await functional.deposit(john.id, amount).run();
  const { data: johnTransaction2 } = await functional.deposit(john.id, amount2).run();
  const { data: johnTransaction3 } = await functional.withdraw(john.id, amount3).run();
  const { data: balance } = await functional.getBalance(john.id).run();

  deepEq(balance, { balance: johnTransaction.amountInCents + johnTransaction2.amountInCents + johnTransaction3.amountInCents });
}

async function testTransferAmount() {
  const amount = '10.5';
  const amount2 = '56.8';
  const amount3 = '2.3';
  const { data: john } = await createUser(johnUser);
  const { data: jane } = await createUser(janeUser);
  const { data: johnTransaction } = await functional.deposit(john.id, amount).run();
  const { data: janeTransaction } = await functional.deposit(jane.id, amount2).run();
  const { data: johnBalance } = await functional.getBalance(john.id).run();
  const { data: janeBalance } = await functional.getBalance(jane.id).run();
  deepEq(johnBalance, { balance: johnTransaction.amountInCents });
  deepEq(janeBalance, { balance: janeTransaction.amountInCents });

  const { data: transference } = await functional.transferAmount(john.id, jane.id, amount3).run();
  const { data: johnBalance2 } = await functional.getBalance(john.id).run();
  const { data: janeBalance2 } = await functional.getBalance(jane.id).run();
  deepEq(johnBalance2, { balance: johnBalance.balance - transference.amountInCents });
  deepEq(janeBalance2, { balance: janeBalance.balance + transference.amountInCents });
}

execute(tests, repository.dropDb).finally();