const User = require('./user');

class UserRepository {
  constructor() {
    this.database = {
      users: [],
    };
  }

  async createUser(userDto) {
    const id = this.database.users.length + 1;
    const user = { id, firstName: userDto.firstName, lastName: userDto.lastName, email: userDto.email };
    this.database.users.push(user);
    return new User(user.id, user.firstName, user.lastName, user.email);
  }

  async getUser(userId) {
    const maybeUser = this.database.users.find((user) => user.id === userId);
    return maybeUser
      ? new User(maybeUser.id, maybeUser.firstName, maybeUser.lastName, maybeUser.email)
      : null;
  }
}

module.exports = UserRepository;