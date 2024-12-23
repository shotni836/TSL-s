import CryptoJS from 'crypto-js';

const SECRET_KEY = '1234567890abcdef';

// Encrypt data
export const encryptData = (plainText) => {
    const iv = CryptoJS.lib.WordArray.random(16); // Generate random IV
    const key = CryptoJS.enc.Utf8.parse(SECRET_KEY); // Convert the secret key to a word array
    const stringData = plainText.toString();
    // Encrypt with AES in CBC mode
    const encrypted = CryptoJS.AES.encrypt(stringData, key, { iv: iv });

    // Combine IV and encrypted data (IV first, then encrypted data)
    const result = iv.toString(CryptoJS.enc.Base64) + encrypted.toString();
    const originalData = result.toString()
        .replace(/\+\+/g, 'xMl3Jk')  // Replace all occurrences of '++' with 'xMl3Jk'
        .replace(/\+/g, 'xMl2KR')    // Replace all occurrences of '+' with 'xMl2KR'
        .replace(/\//g, 'Por21Ld')    // Replace '+' with 'xMl2KR'
        .replace('/', 'Por21Ld')

    return originalData;
}

// Decrypt data
export const decryptData = (encryptedText) => {
    if (!encryptedText) {
        return '';
    }

    const key = CryptoJS.enc.Utf8.parse(SECRET_KEY); // Convert the secret key to a word array

    // Reverse the custom replacements
    const originalText = encryptedText
        .replace(/Por21Ld/g, '/') // Replace 'Por21Ld' back to '/'
        .replace(/xMl2KR/g, '+')  // Replace 'xMl2KR' back to '+'
        .replace(/xMl3Jk/g, '++'); // Replace 'xMl3Jk' back to '++'

    // Extract the IV (Base64 encoded 16 bytes) and encrypted data
    const ivBase64 = originalText.substring(0, 24); // First 24 characters represent the IV (Base64-encoded 16 bytes)
    const encryptedData = originalText.substring(24); // Remaining text is the encrypted data

    // Parse the IV and encrypted data
    const iv = CryptoJS.enc.Base64.parse(ivBase64); // Decode the IV from Base64
    const encrypted = encryptedData;

    // Decrypt with AES in CBC mode
    const decrypted = CryptoJS.AES.decrypt(encrypted, key, { iv: iv });

    // Convert decrypted data back to UTF-8 string
    const plainText = decrypted.toString(CryptoJS.enc.Utf8);

    return plainText;
};