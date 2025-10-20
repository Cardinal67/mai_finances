const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config();

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default_32_char_key_please_change!';

// Ensure key is exactly 32 bytes
const KEY = Buffer.from(ENCRYPTION_KEY.padEnd(32).substring(0, 32));
const IV_LENGTH = 16;

/**
 * Encrypts sensitive text data (e.g., account numbers, routing numbers)
 * @param {string} text - Plain text to encrypt
 * @returns {string} - Encrypted text in format: iv:encryptedData
 */
function encrypt(text) {
    if (!text) return null;
    
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypts encrypted data
 * @param {string} text - Encrypted text in format: iv:encryptedData
 * @returns {string} - Decrypted plain text
 */
function decrypt(text) {
    if (!text) return null;
    
    const parts = text.split(':');
    const iv = Buffer.from(parts.shift(), 'hex');
    const encryptedText = Buffer.from(parts.join(':'), 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
}

/**
 * Gets the last 4 digits of an account number for display purposes
 * @param {string} accountNumber - Full account number
 * @returns {string} - Last 4 digits
 */
function getLast4Digits(accountNumber) {
    if (!accountNumber) return '';
    return accountNumber.slice(-4);
}

module.exports = {
    encrypt,
    decrypt,
    getLast4Digits
};
