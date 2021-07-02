class Parser {
  capitalizeWord(word) {
    const trimmedWord = word.trim();
    return trimmedWord.charAt(0).toUpperCase() + trimmedWord.substring(1).toLowerCase();
  }

  capitalizeSentence(sentence) {
    return sentence.trim().split(' ').map(this.capitalizeWord).join(' ');
  }

  stringFloatToCents(amount) {
    const [int, cents] = amount.trim().split('.');
    const appendedCents = cents ? cents + '0' : '00';
    const amountAsString = int + appendedCents.substring(0, 2);
    return parseInt(amountAsString, 10);
  }

  parseName(name) {
    if (typeof name !== 'string' || name.length < 2) throw new Error('Invalid name');
    return this.capitalizeSentence(name);
  }

  parseFirstName(firstName) {
    try {
      return this.parseName(firstName);
    } catch(error) {
      throw new Error('Invalid first name');
    }
  }

  parseLastName(lastName) {
    try {
      return this.parseName(lastName);
    } catch(error) {
      throw new Error('Invalid last name');
    }
  }

  parseEmail(email) {
    if (typeof email !== 'string' || email.length < 2 || email.search('@') < 0) throw new Error('Invalid email');
    return email.trim().toLowerCase();
  }

  parseAmount(amount) {
    const value = typeof amount === 'string' && parseFloat(amount) || NaN;
    if (isNaN(value)) throw new Error('Invalid amount');
    return this.stringFloatToCents(amount);
  }
}

module.exports = Parser;