const sql = require('mssql');
require('dotenv').config();

const sqlConfig = {
  server: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 1433,
  database: process.env.DB_NAME || 'test',
  user: process.env.DB_USERNAME || 'sa',
  password: process.env.DB_PASSWORD || '',
  options: {
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true' || true,
  },
};

// export connection pool

const createConnection = async () => {
  const pool = await sql.connect(sqlConfig);
  return pool;
};

module.exports = {
  createConnection,
};
