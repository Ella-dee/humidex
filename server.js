const express = require('express');
const app = express();

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'humidex_cities',
  password: 'admin',
  port: 5432,
});

pool.connect((err) => {
  if (err) {
    console.error('Error connecting to PostgreSQL:', err);
  } else {
    console.log('Connected to PostgreSQL');
  }
});
/*
app.get('/api/cities', (req, res) => {
    pool.query('SELECT * FROM city', (err, result) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        res.json(result.rows);
      }
    });
  });*/

  app.post('/api/cities', (req, res) => {
    const { zipCode } = req.body;
  console.log("i'm here");
    pool.query(
      'Select * from city  where zip_code =  $1 RETURNING *',
      [zipCode],
      (err, result) => {
        if (err) {
          console.error('Error executing query:', err);
          res.status(500).json({ error: 'Internal Server Error' });
        } else {
          res.json(result.rows[0]);
        }
      }
    );
  });