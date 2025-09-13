const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * Generate a new RSA key pair for digital signatures
 * @param {string} userId - The user ID to associate with the keys
 * @returns {Object} - Object containing the public and private keys
 */
const generateKeyPair = (userId) => {
  // Generate a new key pair
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });

  // Create keys directory if it doesn't exist
  const keysDir = path.join(__dirname, '..', 'keys');
  if (!fs.existsSync(keysDir)) {
    fs.mkdirSync(keysDir, { recursive: true });
  }

  // Save keys to files
  const publicKeyPath = path.join(keysDir, `${userId}_public.pem`);
  const privateKeyPath = path.join(keysDir, `${userId}_private.pem`);
  
  fs.writeFileSync(publicKeyPath, publicKey);
  fs.writeFileSync(privateKeyPath, privateKey);

  return {
    publicKey,
    privateKey,
    publicKeyPath,
    privateKeyPath
  };
};

/**
 * Get an existing key pair for a user
 * @param {string} userId - The user ID associated with the keys
 * @returns {Object|null} - Object containing the public and private keys, or null if not found
 */
const getKeyPair = (userId) => {
  const keysDir = path.join(__dirname, '..', 'keys');
  const publicKeyPath = path.join(keysDir, `${userId}_public.pem`);
  const privateKeyPath = path.join(keysDir, `${userId}_private.pem`);

  if (!fs.existsSync(publicKeyPath) || !fs.existsSync(privateKeyPath)) {
    return null;
  }

  const publicKey = fs.readFileSync(publicKeyPath, 'utf8');
  const privateKey = fs.readFileSync(privateKeyPath, 'utf8');

  return {
    publicKey,
    privateKey,
    publicKeyPath,
    privateKeyPath
  };
};

/**
 * Get or create a key pair for a user
 * @param {string} userId - The user ID to associate with the keys
 * @returns {Object} - Object containing the public and private keys
 */
const getOrCreateKeyPair = (userId) => {
  const existingKeys = getKeyPair(userId);
  if (existingKeys) {
    return existingKeys;
  }
  return generateKeyPair(userId);
};

module.exports = {
  generateKeyPair,
  getKeyPair,
  getOrCreateKeyPair
};