# !pip install cryptography
from cryptography.fernet import Fernet

class Encryption:
    def __init__(self, key=None):
        """
        Initialize the encryption class with an optional key.
        If no key is provided, a new one is generated.
        """
        # Generate a new key if none is provided
        self.key = key or Fernet.generate_key()
        self.cipher = Fernet(self.key)

    def encrypt(self, username: str, password: str) -> dict:
        """
        Encrypt the username and password.
        
        Parameters:
            username (str): The user's username.
            password (str): The user's password.
        
        Returns:
            dict: A dictionary containing encrypted username and password.
        """
        encrypted_username = self.cipher.encrypt(username.encode())
        encrypted_password = self.cipher.encrypt(password.encode())
        
        return {
            "encrypted_username": encrypted_username,
            "encrypted_password": encrypted_password
        }

    def decrypt(self, encrypted_data: dict) -> dict:
        """
        Decrypt the username and password.
        
        Parameters:
            encrypted_data (dict): A dictionary containing encrypted username and password.
        
        Returns:
            dict: A dictionary containing decrypted username and password.
        """
        decrypted_username = self.cipher.decrypt(encrypted_data["encrypted_username"]).decode()
        decrypted_password = self.cipher.decrypt(encrypted_data["encrypted_password"]).decode()
        
        return {
            "username": decrypted_username,
            "password": decrypted_password
        }

    def get_key(self) -> bytes:
        """
        Get the encryption key.
        
        Returns:
            bytes: The key used for encryption and decryption.
        """
        return self.key
