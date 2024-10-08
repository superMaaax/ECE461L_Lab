# !pip install cryptography
# encryption.py
from cryptography.fernet import Fernet
import os

KEY_FILE = "encryption_key.key"

# Generate or load encryption key
if not os.path.exists(KEY_FILE):
    with open(KEY_FILE, "wb") as key_file:
        key = Fernet.generate_key()
        key_file.write(key)
else:
    with open(KEY_FILE, "rb") as key_file:
        key = key_file.read()

cipher = Fernet(key)

def encrypt_data(data: str) -> str:
    """
    Encrypts the given string data.
    
    Parameters:
        data (str): The data to encrypt.
    
    Returns:
        str: The encrypted data as a string.
    """
    return cipher.encrypt(data.encode()).decode()

def decrypt_data(data: str) -> str:
    """
    Decrypts the given string data.
    
    Parameters:
        data (str): The encrypted data to decrypt.
    
    Returns:
        str: The decrypted data.
    """
    return cipher.decrypt(data.encode()).decode()
