const express = require('express');
const sql = require('mssql');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

const config = {
    user: 'adminuser',
    password: 'YOUR_PASSWORD',
    server: 'notes-server-123.database.windows.net',
    database: 'notesdb',
    options: {
        encrypt: true
    }
};

// Home page
app.get('/', async (req, res) => {
    try {
        await sql.connect(config);
        const result = await sql.query`SELECT * FROM Notes`;

        let notes = result.recordset.map(n => `<li>${n.content}</li>`).join('');

        res.send(`
            <h2>Notes App</h2>
            <form method="POST" action="/add">
                <input name="note" placeholder="Enter note"/>
                <button>Add</button>
            </form>
            <ul>${notes}</ul>
        `);
    } catch (err) {
        res.send("Error: " + err);
    }
});

// Add note
app.post('/add', async (req, res) => {
    try {
        await sql.connect(config);
        await sql.query`INSERT INTO Notes (content) VALUES (${req.body.note})`;
        res.redirect('/');
    } catch (err) {
        res.send("Error: " + err);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running"));