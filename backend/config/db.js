const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://postgres:1234@localhost:5432/hrms_db",
  ...(process.env.DATABASE_URL && process.env.DATABASE_URL.includes("render.com") 
      ? { ssl: { rejectUnauthorized: false } } 
      : {})
});

module.exports = pool;