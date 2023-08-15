require('dotenv').config();
const express = require('express')
const rateLimit = require('express-rate-limit')
const Database = require('./database')
const logger = require('./logger')
const { escape } = require('mysql')

const db = Database.connect({ host: process.env.database_host, user: process.env.database_user, password: process.env.database_password, database: process.env.database_database })

const app = express()

const limiter = rateLimit({
	windowMs: 10 * 1000,
	max: 5,
	standardHeaders: true,
	legacyHeaders: false,
    message: { access: false, message: 'Too many requests, please try again later' }
})

app.use(limiter)

app.get('/verify', async (req, res) => {
    const query = req.query
    const machine_id = query.machine_id
    const license_type = query.license_type
    if (!machine_id || !license_type) return res.status(400).json({ message: 'Bad request' })
    const data = await db("SELECT * FROM `licenses` WHERE `machine_id` = " + escape(machine_id) + " AND `license_type` = " + escape(license_type) + " AND `expires_at` > NOW() LIMIT 1")
    if (!data) return res.status(500).json({ message: "Server error" })
    if (data.length == 0) return res.status(200).json({ access: false })
    return res.status(200).json({ access: true, expires_at: data[0].expires_at })
})

app.get('*', async (req, res) => {
    return res.status(404).json({ message: 'Route not found' })
})

app.listen(process.env.port, () => {
    logger.info("Uruchomiono serwer na porcie " + process.env.port)
})