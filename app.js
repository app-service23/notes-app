require('dotenv').config();
const express = require('express');
const sql = require('mssql');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// Environment variable se connection string le raha hai
const config = {
    server: process.env.DB_SERVER,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    options: { encrypt: true }
    pool: { max: 10, min: 0, idleTimeoutMillis: 30000 }
};

await sql.connect(config);

// Home page
app.get('/', async (req, res) => {
    try {
        await sql.connect(config);
        const result = await sql.query`SELECT * FROM Notes`;

        let notes = result.recordset.map(n => `<li>${n.content}</li>`).join('');

        res.send(`
            <h2>Notes App</h2>
            <form method="POST" action="/add">
                <input name="note" placeholder="Enter note" required/>
                <button>Add</button>
            </form>
            <ul>${notes}</ul>
        `);
    } catch (err) {
        res.send("Error: " + err.message);
    }
});

// Add note
app.post('/add', async (req, res) => {
    try {
        await sql.connect(config);
        await sql.query`INSERT INTO Notes (content) VALUES (${req.body.note})`;
        res.redirect('/');
    } catch (err) {
        res.send("Error: " + err.message);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));