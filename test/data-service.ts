// Additional TypeScript file with more issues for comprehensive testing
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export class DataService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string) {
    this.apiKey = apiKey; // Security: API key should be marked as readonly
    this.baseUrl = baseUrl;
  }

  // Missing proper error handling and return type issues
  async fetchUser(id: number) {
    // Should specify return type
    const response = await fetch(`${this.baseUrl}/users/${id}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`, // Security: exposing API key in logs
        "Content-Type": "application/json",
      },
    });

    return response.json(); // No error checking or type validation
  }

  // Type safety issues with generics
  async updateResource<T>(endpoint: string, data: any): Promise<T> {
    // Using 'any' defeats purpose of generics
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Request failed"); // Generic error message
    }

    return response.json() as T; // Type assertion without validation
  }

  // Performance issue: no caching, repeated API calls
  async getUserPermissions(userId: number): Promise<string[]> {
    const user = await this.fetchUser(userId); // Could cache this
    const permissions = await fetch(
      `${this.baseUrl}/users/${userId}/permissions`
    );
    const roles = await fetch(`${this.baseUrl}/users/${userId}/roles`); // Multiple sequential calls

    // No proper error handling for failed requests
    return [...(await permissions.json()), ...(await roles.json())];
  }
}

// Enum issues
enum UserRole {
  ADMIN, // No explicit values - fragile to reordering
  MODERATOR,
  USER,
  GUEST,
}

// Interface with optional properties but no validation
export interface UserSettings {
  theme?: "dark" | "light";
  notifications?: boolean;
  language?: string; // Should be union type of supported languages
  customFields?: { [key: string]: any }; // Using any and index signature
}

// Class with inheritance issues
export abstract class BaseEntity {
  protected id: number; // Should be readonly
  protected createdAt: Date;

  constructor(id: number) {
    this.id = id;
    this.createdAt = new Date();
  }

  // Missing implementation details
  abstract validate(): boolean;

  // Public method accessing protected field
  getId(): number {
    return this.id; // Direct access without validation
  }
}

export class AdminUser extends BaseEntity {
  private permissions: UserRole[];

  constructor(id: number, permissions: UserRole[]) {
    super(id);
    this.permissions = permissions; // No validation of permissions
  }

  validate(): boolean {
    return this.permissions.length > 0; // Weak validation
  }

  // Security issue: privilege escalation potential
  addPermission(role: UserRole): void {
    this.permissions.push(role); // No access control check
  }

  // Type coercion issue
  hasPermission(role: string): boolean {
    // Should accept UserRole, not string
    return this.permissions.includes(role as unknown as UserRole); // Unsafe type assertion
  }
}
