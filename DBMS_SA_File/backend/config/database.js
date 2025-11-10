const mysql = require('mysql2');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

console.log('Database Config:');
console.log('Host:', process.env.DB_HOST);
console.log('User:', process.env.DB_USER);
console.log('Database:', process.env.DB_NAME);
console.log('Password set:', !!process.env.DB_PASSWORD);
console.log('Password length:', process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 0);

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '#Prateeksql@5434',
  database: process.env.DB_NAME || 'iit_jammu_student_affairs',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Get promise-based connection
const promisePool = pool.promise();

// Test connection and provide fallback
let dbConnected = false;

async function testConnection() {
  try {
    const connection = await promisePool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    dbConnected = true;
    return true;
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    console.log('📝 Using mock data fallback mode');
    dbConnected = false;
    return false;
  }
}

// Test connection on startup
testConnection();

module.exports = {
  query: async (...args) => {
    if (!dbConnected) {
      throw new Error('Database not connected - using fallback data');
    }
    return promisePool.query(...args);
  },
  isConnected: () => dbConnected,
  testConnection
};
