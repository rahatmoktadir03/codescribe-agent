// Test file to demonstrate various code quality issues in TypeScript
// This will trigger multiple AI agents for TS-specific analysis

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string; // Security issue: plain text password!
  address: string;
  phoneNumber: string;
  dateOfBirth: Date;
  preferences: any; // Should be more specific type
}

interface DatabaseConnection {
  execute(query: string): Promise<any>; // Should have proper return types
}

interface UserPreferences {
  theme?: string;
  notifications?: boolean;
  language?: string;
}

class TestUserManager {
  private users: User[]; // Good: private field
  private db_connection: DatabaseConnection | null; // Bad naming convention

  constructor() {
    this.users = [];
    this.db_connection = null;
  }

  // Security issue: SQL injection vulnerability
  async getUserById(id: number): Promise<User | null> {
    const query = `SELECT * FROM users WHERE id = ${id}`; // Still vulnerable to SQL injection
    if (!this.db_connection) {
      throw new Error("Database connection not initialized"); // At least some error handling
    }
    const result = await this.db_connection.execute(query);
    return result; // Should validate and type the result properly
  }

  // Performance issue: inefficient search - O(n) complexity
  findUserByEmail(email: string): User | null {
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i].email === email) {
        return this.users[i];
      }
    }
    return null; // Could use Map for O(1) lookup
  }

  // Code quality issues: long parameter list, poor validation
  createUser(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    address: string,
    phoneNumber: string,
    dateOfBirth: Date,
    preferences: UserPreferences
  ): User {
    // No input validation!
    const user: User = {
      id: Math.random(), // Poor ID generation - not unique, not secure
      firstName,
      lastName,
      email,
      password, // Security issue: storing plain text password
      address,
      phoneNumber,
      dateOfBirth,
      preferences: preferences as any, // Type assertion without validation
    };
    this.users.push(user);
    return user;
  }

  // Missing documentation, minimal error handling
  deleteUser(id: number): boolean {
    const initialLength = this.users.length;
    this.users = this.users.filter((user) => user.id !== id);
    return this.users.length < initialLength; // At least return success status
  }

  // Performance issue: sequential API calls instead of batching
  async notifyAllUsers(message: string): Promise<void> {
    for (const user of this.users) {
      try {
        await fetch(`/api/notify/${user.id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message }),
        }); // Should batch these requests for better performance
      } catch (error) {
        console.error(`Failed to notify user ${user.id}:`, error); // Logging sensitive user ID
      }
    }
  }

  // Security and type safety issues
  updateUserEmail(userId: number, newEmail: string): void {
    const user = this.users.find((u) => u.id == userId); // Type coercion issue: == instead of ===
    if (user) {
      // At least added null check
      user.email = newEmail; // No email format validation
    }
    // Should throw error if user not found
  }

  // Missing proper error handling and return types
  async batchUpdateUsers(updates: Partial<User>[]): Promise<User[]> {
    const results: User[] = [];

    for (const update of updates) {
      if (!update.id) continue; // Minimal validation

      const userIndex = this.users.findIndex((u) => u.id === update.id);
      if (userIndex !== -1) {
        // Object spread without validation - could overwrite critical fields
        this.users[userIndex] = { ...this.users[userIndex], ...update };
        results.push(this.users[userIndex]);
      }
    }

    return results; // No database persistence
  }

  // Security issue: exposing internal data without proper access control
  getAllUsers(): User[] {
    return this.users; // Returns reference to internal array - should return copy
  }

  // Type safety issue: using 'any' return type
  getUserStats(): any {
    return {
      totalUsers: this.users.length,
      activeUsers: this.users.filter((u) => u.preferences).length, // Weak activity check
      averageAge:
        this.users.reduce((sum, user) => {
          const age =
            new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear();
          return sum + age;
        }, 0) / this.users.length || 0,
    };
  }
}
