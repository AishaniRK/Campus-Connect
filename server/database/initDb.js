require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function initializeDatabase() {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '';
  const database = process.env.DB_NAME || 'campus_connect';

  console.log(`[InitDB] Connecting to MySQL at ${host}:${port} as ${user}...`);

  let connection;
  try {
    // Connect without database first to ensure CREATE DATABASE works
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      multipleStatements: true
    });

    console.log('[InitDB] Connected to MySQL server.');

    console.log(`[InitDB] Ensuring database '${database}' exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.query(`USE \`${database}\`;`);

    // Read and run schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      console.log('[InitDB] Executing schema.sql...');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await connection.query(schemaSql);
      console.log('[InitDB] Schema created successfully.');
    }

    // Read and run seed.sql
    const seedPath = path.join(__dirname, 'seed.sql');
    if (fs.existsSync(seedPath)) {
      console.log('[InitDB] Executing seed.sql...');
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      await connection.query(seedSql);
      console.log('[InitDB] Seed data loaded successfully.');
    }

    console.log('[InitDB] Database initialization completed successfully!');
  } catch (err) {
    console.error('[InitDB Error]', err.message);
    if (err.code === 'ECONNREFUSED') {
      console.error('\nNOTE: MySQL daemon does not appear to be running or port is blocked.');
      console.error('Make sure your MySQL server is running: brew services start mysql or mysqld');
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

if (require.main === module) {
  initializeDatabase();
}

module.exports = initializeDatabase;

