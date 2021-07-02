class UserDto {
  constructor(parser, firstName, lastName, email) {
    this.firstName = parser.parseFirstName(firstName);
    this.lastName = parser.parseLastName(lastName);
    this.email = parser.parseEmail(email);
  }
}

module.exports = UserDto;