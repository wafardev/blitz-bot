const pool = require("../database/db");
const {
  deriveKey,
  encryptPassphrase,
  decryptPassphrase,
} = require("../secret/keyHasher");
const generateNewWallet = require("../utils/walletGenerator");

async function queryPool(chatId) {
  try {
    const query = "SELECT * FROM wallet_database WHERE t_id = $1";
    const result = await pool.query(query, [chatId]);
    return result.rows[0];
  } catch (error) {
    console.error("Error querying pool:", error.message);
  }
}

async function generateAndInsertWallet(chatId) {
  try {
    const { privateKey, userAddress } = generateNewWallet();

    const encrypted_key = encryptPassphrase(
      deriveKey(chatId.toString()),
      privateKey
    );

    // Insert wallet information into the database
    const insertQuery = `
          INSERT INTO wallet_database (t_id, encrypted_key, address)
          VALUES ($1, $2, $3)
          RETURNING t_id, encrypted_key, address;
        `;

    const result = await pool.query(insertQuery, [
      chatId,
      encrypted_key,
      userAddress,
    ]);

    console.log("Inserted wallet data:", result.rows[0]);
    return result.rows[0];
  } catch (error) {
    console.error("Error generating and inserting wallet:", error.message);
  }
}

function decryptPrivateKey(chatId, encryptedKey) {
  try {
    const privateKey = decryptPassphrase(
      deriveKey(chatId.toString()),
      encryptedKey
    );
    return privateKey;
  } catch (error) {
    console.error("Error decrypting private key:", error.message);
  }
}

async function updateWallet(chatId) {
  try {
    const deleteQuery = `DELETE FROM wallet_database WHERE t_id = $1`;

    await pool.query(deleteQuery, [chatId]);

    const answer = await generateAndInsertWallet(chatId);
    console.log("Inserted wallet data:", answer);
  } catch (error) {
    console.error("Error deleting and inserting new wallet:", error.message);
  }
}

module.exports = {
  queryPool,
  generateAndInsertWallet,
  decryptPrivateKey,
  updateWallet,
};
