// Test file to demonstrate various code quality issues
// This will trigger multiple AI agents

class UserManager {
  constructor() {
    this.users = [];
    this.db_connection = null; // Bad naming convention
  }

  // Security issue: SQL injection vulnerability
  getUserById(id) {
    const query = `SELECT * FROM users WHERE id = ${id}`; // Vulnerable to SQL injection
    return this.db_connection.execute(query);
  }

  // Performance issue: inefficient search
  findUserByEmail(email) {
    for (let i = 0; i < this.users.length; i++) {
      // O(n) search, could use Map
      if (this.users[i].email === email) {
        return this.users[i];
      }
    }
    return null;
  }

  // Code quality issues: no error handling, long parameter list
  createUser(
    firstName,
    lastName,
    email,
    password,
    address,
    phoneNumber,
    dateOfBirth,
    preferences
  ) {
    const user = {
      id: Math.random(), // Poor ID generation
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: password, // Storing plain text password!
      address: address,
      phoneNumber: phoneNumber,
      dateOfBirth: dateOfBirth,
      preferences: preferences,
    };
    this.users.push(user);
    return user;
  }

  // Missing documentation, no error handling
  deleteUser(id) {
    this.users = this.users.filter((user) => user.id !== id);
  }

  // Performance issue: multiple API calls in loop
  async notifyAllUsers(message) {
    for (const user of this.users) {
      await fetch(`/api/notify/${user.id}`, {
        method: "POST",
        body: JSON.stringify({ message }),
      }); // Should batch these requests
    }
  }

  // Security issue: no input validation
  updateUserEmail(userId, newEmail) {
    const user = this.users.find((u) => u.id == userId); // Type coercion issue
    user.email = newEmail; // No null check
  }
}
