import crypto from 'crypto';

const token = crypto.randomBytes(64).toString('hex');

console.log("Generated token:", token);
