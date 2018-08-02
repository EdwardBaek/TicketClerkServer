if( !process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
  require('dotenv').load();
}
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

module.exports = pool;
