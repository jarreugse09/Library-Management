// utils/generateDonationId.js
const { v4: uuidv4 } = require('uuid');

function generateDonationId() {
  return 'DON-' + uuidv4(); // e.g., DON-7a8b3b10-1234...
}

module.exports = { generateDonationId };
