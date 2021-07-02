const express = require('express');
const router = express.Router();

// Object Oriented
const Account = require('./object-oriented/index');
const Parser = require('./object-oriented/parser');
const UserRepository = require('./object-oriented/user/user.repository');
const TransactionRepository = require('./object-oriented/transaction/transaction.repository');
const parser = new Parser();
const userRepository = new UserRepository();
const transactionRepository = new TransactionRepository();
const account = new Account(parser, userRepository, transactionRepository);

function oopHandler(fn) {
  return async (req, res) => {
    try {
      const response = await fn(req, res);
      res.send(response);
    } catch(error) {
      res.status(400).send({ error: error.message });
    }
  };
}

router.post('/object-oriented/user', oopHandler(async (req, res) => {
  const { firstName, lastName, email } = req.body;
  return account.createUser(firstName, lastName, email);
}));

router.get('/object-oriented/user/:id', oopHandler(async (req, res) => {
  const { id } = req.params;
  return account.getUser(id);
}));

router.post('/object-oriented/user/deposit', oopHandler(async (req, res) => {
  const { userId, amount } = req.body;
  return account.deposit(userId, amount);
}));

router.post('/object-oriented/user/withdraw', oopHandler(async (req, res) => {
  const { userId, amount } = req.body;
  return account.withdraw(userId, amount);
}));

router.get('/object-oriented/user/balance/:userId', oopHandler(async (req, res) => {
  const { userId } = req.params;
  return account.getBalance(userId);
}));

router.post('/object-oriented/transaction/transference', oopHandler(async (req, res) => {
  const { fromUserId, toUserId, amount } = req.body;
  return account.transferAmount(fromUserId, toUserId, amount);
}));

// Functional

const fp = require('./functional/');

function fpHandler(fn) {
  return async (req, res) => {
    const { data, error } = await fn(req, res);
    if (error) res.status(400).send({ error: error.message });
    else res.send(data);
  };
}

router.post('/functional/user', fpHandler(async (req, res) => {
  const { firstName, lastName, email } = req.body;
  return fp.createUser(firstName, lastName, email).run();
}));

router.get('/functional/user/:id', fpHandler(async (req, res) => {
  const { id } = req.params;
  return fp.getUser(id).run();
}));

router.post('/functional/user/deposit', fpHandler(async (req, res) => {
  const { userId, amount } = req.body;
  return fp.deposit(userId, amount).run();
}));

router.post('/functional/user/withdraw', fpHandler(async (req, res) => {
  const { userId, amount } = req.body;
  return fp.withdraw(userId, amount).run();
}));

router.get('/functional/user/balance/:userId', fpHandler(async (req, res) => {
  const { userId } = req.params;
  return await fp.getBalance(userId).run();
}));

router.post('/functional/transaction/transference', fpHandler(async (req, res) => {
  const { fromUserId, toUserId, amount } = req.body;
  return fp.transferAmount(fromUserId, toUserId, amount).run();
}));

module.exports = router;
