const { IO, deepCopy } = require('./utils');

const initialDatabase = {
  users: [],
  transactions: [],
  transferences: [],
};

let database = deepCopy(initialDatabase);

function createUser(firstName, lastName, email) {
  return IO
    .of(null)
    .map(() => database.users.length + 1)
    .map((id) => ({ id, firstName, lastName, email }))
    .tap((user) => database.users.push(user))
    .map(deepCopy);
}

function getUsers() {
  return IO
    .of(null)
    .map(() => database.users)
    .map((users) => users.map(deepCopy));
}

function getUser(userId) {
  return IO
    .of(null)
    .map(() => database.users)
    .map((users) => users.find((user) => user.id === userId))
    .map((maybeUser) => maybeUser ? deepCopy(maybeUser) : null);
}

function createTransactionFromUserId(userId, amountInCents) {
  return IO
    .of(null)
    .map(() => database.transactions.length + 1)
    .map((id) => ({ id, userId, amountInCents }))
    .tap((transaction) => database.transactions.push(transaction))
    .map(deepCopy);
}

function createTransaction(user, amountInCents) {
  return createTransactionFromUserId(user.id, amountInCents);
}

function getTransactionById(transactionId) {
  return IO
    .of(null)
    .map(() => database.transactions)
    .map((transactions) => transactions.find((transaction) => transaction.id === transactionId))
    .map((maybeTransaction) => maybeTransaction ? deepCopy(maybeTransaction) : null);
}

function getTransactionsFromUserId(userId) {
  return IO
    .of(null)
    .map(() => database.transactions)
    .map((transactions) => transactions.filter((transaction) => transaction.userId === userId))
    .map(deepCopy);
}

function getTransactionsFromUser(user) {
  return getTransactionsFromUserId(user.id);
}

function createTransference(fromUser, toUser, amountInCents) {
  return IO
    .of(null)
    .map(() => database.transferences.length + 1)
    .zip(createTransaction(fromUser, amountInCents * -1), (id, fromTransaction) => ({ id, fromTransaction }))
    .zip(createTransaction(toUser, amountInCents), (params, toTransaction) => ({ ...params, toTransaction }))
    .map((params) => ({ id: params.id, fromTransactionId: params.fromTransaction.id, toTransactionId: params.toTransaction.id, amountInCents }))
    .tap((transference) => database.transferences.push(transference))
    .map(deepCopy);
}

async function dropDb() {
  database = deepCopy(initialDatabase);
}

async function inspectDb(logger) {
  logger(database);
}

module.exports = {
  createTransaction,
  createTransference,
  createUser,
  dropDb,
  getTransactionById,
  getTransactionsFromUser,
  getUser,
  inspectDb,
}