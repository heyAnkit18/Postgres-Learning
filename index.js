const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// PostgreSQL setup
const pool = new Pool({
    user: "postgres",       
    host: "localhost",      
    database: "DemoDB",     
    password: "1806",       
    port: 5432,            
});

// Ensure tasks table exists
pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        completed BOOLEAN 
    )
`)
    .then(() => console.log('Table "tasks" is ready.'))
    .catch((err) => console.error('Error creating table:', err.message));

// Routes
// Get all tasks
app.get('/tasks', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tasks');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//create 
app.post('/tasks', async (req, res) => {
    const { title, completed = false } = req.body;  

    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO tasks (title, completed) VALUES ($1, $2) RETURNING *',
            [title, completed]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



// Update a task
app.put('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const { title, completed } = req.body;

    if (!title || completed === undefined) {
        return res.status(400).json({ error: 'Title and completed status are required' });
    }

    try {
        const result = await pool.query(
            'UPDATE tasks SET title = $1, completed = $2 WHERE id = $3 RETURNING *',
            [title, completed === "true" || completed === true, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a task
app.delete('/tasks/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json({ message: 'Task deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start server
app.listen(port, () => {
    console.log(`App running on http://localhost:${port}`);
});
