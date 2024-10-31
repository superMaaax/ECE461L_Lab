# !pip install cryptography
# encryption.py

def encrypt_data(inputText,N=2, D=2):
    reversed_text = inputText[::-1]

    encrypted_text = ""
    for char in reversed_text:
        ascii_val = ord(char)
        if (
            34 <= ascii_val <= 126
        ):  # Valid ASCII printable characters (except space and !)
            new_ascii_val = ascii_val + (N * D)
            if new_ascii_val > 126:
                new_ascii_val = 34 + (new_ascii_val - 127)
            elif new_ascii_val < 34:
                new_ascii_val = 127 - (34 - new_ascii_val)
            encrypted_text += chr(new_ascii_val)
        else:
            encrypted_text += char  # Keep invalid characters as they are

    return encrypted_text


def decrypt_data(encryptedText, N=2, D=2):
    decrypted_text = ""
    for char in encryptedText:
        ascii_val = ord(char)
        if 34 <= ascii_val <= 126:
            new_ascii_val = ascii_val - (N * D)
            if new_ascii_val > 126:
                new_ascii_val = 34 + (new_ascii_val - 127)
            elif new_ascii_val < 34:
                new_ascii_val = 127 - (34 - new_ascii_val)
            decrypted_text += chr(new_ascii_val)
        else:
            decrypted_text += char

    return decrypted_text[::-1]