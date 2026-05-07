const { Client } = require('pg');

async function testConnection() {
  const client = new Client({
    connectionString: "postgresql://refferq:refferq@127.0.0.1:5433/refferq"
  });
  
  try {
    await client.connect();
    console.log('Connected successfully');
    const res = await client.query('SELECT 1');
    console.log('Query result:', res.rows[0]);
    await client.end();
  } catch (err) {
    console.error('Connection failed:', err.message);
  }
}

testConnection();
