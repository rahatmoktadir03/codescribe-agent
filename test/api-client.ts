/**
 * API utilities with various issues for testing
 */

interface User {
  id: number;
  name: string;
  email: string;
}

export class APIClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey; // Should be marked as readonly
  }

  // Missing error handling and return type annotation
  async getUser(id) {
    const response = await fetch(`${this.baseUrl}/users/${id}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
    });
    return response.json(); // No error checking
  }

  // Performance issue: not using proper HTTP methods
  async updateUser(user: User): Promise<User> {
    // Should use PUT/PATCH, not POST
    const response = await fetch(`${this.baseUrl}/users/${user.id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });

    if (!response.ok) {
      throw new Error("Failed to update user"); // Generic error message
    }

    return response.json();
  }

  // Missing JSDoc documentation
  async deleteUser(id: number): Promise<void> {
    await fetch(`${this.baseUrl}/users/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });
    // No error handling at all
  }

  // Security issue: logging sensitive data
  async createUser(userData: Partial<User>): Promise<User> {
    console.log("Creating user with data:", userData); // Could log sensitive info

    const response = await fetch(`${this.baseUrl}/users`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    return response.json();
  }
}
