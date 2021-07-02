const { IO } = require('./utils');
const repository = require('./repository');

function capitalizeWord(word) {
  const trimmedWord = word.trim();
  return trimmedWord.charAt(0).toUpperCase() + trimmedWord.substring(1).toLowerCase();
}

function capitalizeSentence(sentence) {
  return sentence.trim().split(' ').map(capitalizeWord).join(' ');
}

function stringFloatToCents(amount) {
  const [int, cents] = amount.trim().split('.');
  const appendedCents = cents ? cents + '0' : '00';
  const amountAsString = int + appendedCents.substring(0, 2);
  return parseInt(amountAsString, 10);
}

function parseName(name) {
  if (typeof name !== 'string' || name.length < 2) return { error: 'Invalid name' };
  return { data: capitalizeSentence(name) };
}

function parseFirstName(name) {
  const parsedName = parseName(name);
  if (parsedName.error) return { error: 'Invalid first name' };
  return parsedName;
}

function parseLastName(name) {
  const parsedName = parseName(name);
  if (parsedName.error) return { error: 'Invalid last name' };
  return parsedName;
}

function parseEmail(email) {
  if (typeof email !== 'string' || email.length < 2 || email.search('@') < 0) return { error: 'Invalid email' };
  return { data: email.trim().toLowerCase() };
}

function parseAmount(amount) {
  const value = typeof amount === 'string' && parseFloat(amount) || NaN;
  if (isNaN(value)) return { error: 'Invalid amount' };
  return { data: stringFloatToCents(amount) };
}

function calculateBalance(transactions) {
  return transactions.reduce((acc, transaction) => acc + transaction.amountInCents, 0);
}

function createUser(firstName, lastName, email) {
  return IO
    .of({ firstName: parseFirstName(firstName) })
    .map((params) => ({ ...params, lastName: parseLastName(lastName) }))
    .map((params) => ({ ...params, email: parseEmail(email) }))
    .flatMap((params) => {
      if (params.firstName.error) return IO.raise(params.firstName.error);
      if (params.lastName.error) return IO.raise(params.lastName.error);
      if (params.email.error) return IO.raise(params.email.error);
      return IO.of(params);
    })
    .flatMap((params) => repository.createUser(params.firstName.data, params.lastName.data, params.email.data))
}

function getUser(userId) {
  return IO
    .of(userId)
    .map(parseInt)
    .flatMap(repository.getUser)
    .flatMap((user) => user ? IO.of(user) : IO.raise('User not found'));
}

function getAmount(amount) {
  return IO
    .of(parseAmount(amount))
    .flatMap((amountInCents) => amountInCents.error ? IO.raise(amountInCents.error) : IO.of(amountInCents.data));
}

function deposit(userId, amount) {
  return getAmount(amount)
    // primeiro argumento é o que vem do IO que está usando o operador "zip", o segundo argumento é o que está sendo concatenado
    .zip(getUser(userId), (amountInCents, user) => ({ user, amountInCents }))
    .flatMap((params) => repository.createTransaction(params.user, params.amountInCents));
}

function withdraw(userId, amount) {
  return deposit(userId, '-' + amount);
}

function getBalance(userId) {
  return getUser(userId)
    .flatMap(repository.getTransactionsFromUser)
    .map(calculateBalance)
    .map((balance) => ({ balance }));
}

function transferAmount(fromUserId, toUserId, amount) {
  return getAmount(amount)
    .zip(getUser(fromUserId), (amountInCents, fromUser) => ({ fromUser, amountInCents }))
    .zip(getUser(toUserId), (params, toUser) => ({ ...params, toUser }))
    .flatMap((params) => repository.createTransference(params.fromUser, params.toUser, params.amountInCents));
}

module.exports = {
  calculateBalance,
  capitalizeWord,
  capitalizeSentence,
  createUser,
  deposit,
  getBalance,
  getUser,
  parseAmount,
  parseEmail,
  parseName,
  stringFloatToCents,
  transferAmount,
  withdraw,
};