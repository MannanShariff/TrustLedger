const crypto = require('crypto');

/**
 * Generate a SHA256 hash for a document
 * @param {Buffer} fileBuffer - The file buffer to hash
 * @returns {string} - The SHA256 hash
 */
const generateDocumentHash = (fileBuffer) => {
  const hash = crypto.createHash('sha256');
  hash.update(fileBuffer);
  return hash.digest('hex');
};

/**
 * Verify a document hash against a stored hash
 * @param {Buffer} fileBuffer - The file buffer to verify
 * @param {string} storedHash - The stored hash to compare against
 * @returns {boolean} - Whether the hashes match
 */
const verifyDocumentHash = (fileBuffer, storedHash) => {
  const computedHash = generateDocumentHash(fileBuffer);
  return computedHash === storedHash;
};

/**
 * Generate a digital signature for a transaction
 * @param {string} transactionData - The transaction data to sign
 * @param {string} privateKey - The private key to sign with (PEM format)
 * @returns {string} - The digital signature
 */
const signTransaction = (transactionData, privateKey) => {
  const sign = crypto.createSign('SHA256');
  sign.update(JSON.stringify(transactionData));
  sign.end();
  return sign.sign(privateKey, 'hex');
};

/**
 * Verify a digital signature for a transaction
 * @param {string} transactionData - The transaction data that was signed
 * @param {string} signature - The signature to verify
 * @param {string} publicKey - The public key to verify with (PEM format)
 * @returns {boolean} - Whether the signature is valid
 */
const verifySignature = (transactionData, signature, publicKey) => {
  const verify = crypto.createVerify('SHA256');
  verify.update(JSON.stringify(transactionData));
  verify.end();
  return verify.verify(publicKey, signature, 'hex');
};

/**
 * Generate a hash for an audit log record
 * @param {Object} data - The data to hash
 * @returns {string} - The SHA256 hash
 */
const generateAuditHash = (data) => {
  const hash = crypto.createHash('sha256');
  hash.update(JSON.stringify(data));
  return hash.digest('hex');
};

module.exports = {
  generateDocumentHash,
  verifyDocumentHash,
  generateAuditHash,
  signTransaction,
  verifySignature
};