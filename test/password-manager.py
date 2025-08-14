# Password utilities with security issues
import hashlib
import random
import string

class PasswordManager:
    def __init__(self):
        self.passwords = {}
        
    def generate_password(self, length=8):
        # Weak password generation
        chars = string.ascii_letters + string.digits
        password = ''.join(random.choice(chars) for _ in range(length))
        return password
    
    def hash_password(self, password):
        # Using MD5 - insecure hashing algorithm!
        return hashlib.md5(password.encode()).hexdigest()
    
    def store_password(self, username, password):
        # No input validation
        hashed = self.hash_password(password)
        self.passwords[username] = hashed
        
    def verify_password(self, username, password):
        if username in self.passwords:
            return self.passwords[username] == self.hash_password(password)
        return False
    
    def get_all_passwords(self):
        # Security issue: exposing all password hashes
        return self.passwords
        
    def backup_passwords(self, filename):
        # No error handling, could fail silently
        with open(filename, 'w') as f:
            for username, password_hash in self.passwords.items():
                f.write(f"{username}:{password_hash}\n")
                
    def load_passwords(self, filename):
        # No validation of file content
        with open(filename, 'r') as f:
            for line in f:
                username, password_hash = line.strip().split(':')
                self.passwords[username] = password_hash
           