require('dotenv').config();
const express = require('express')
const rateLimit = require('express-rate-limit')
const Database = require('./database')
const logger = require('./logger')
const { escape } = require('mysql')
const { Webhook, MessageBuilder } = require('discord-webhook-node');

const db = Database.connect({ host: process.env.database_host, user: process.env.database_user, password: process.env.database_password, database: process.env.database_database })

const app = express()
const hook = new Webhook({
    url: process.env.webhook_url,
    throwErrors: false,
    retryOnLimit: true
})
hook.setUsername("NodeLicenseServer")
let antispam = {}

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
    if (data.length == 0) {
        if (antispam[machine_id] && antispam[machine_id] + (5 * 60 * 1000) > Date.now()) return res.status(200).json({ access: false })
        if (!antispam[machine_id]) antispam[machine_id] = Date.now()
        const embed = new MessageBuilder()
            .setTitle("Unauthorized access")
            .setAuthor(escape(machine_id).substring(1, escape(machine_id).length - 1))
            .setColor("#eb4034")
            .setTimestamp()
            .setDescription("Tried to access **" + escape(license_type) + "** license, but it's not valid or expired.")
            .setFooter("Requested from " + (req.ip || "Unknown IP address"))
        hook.send(embed)

        return res.status(200).json({ access: false })
    }
    return res.status(200).json({ access: true, expires_at: data[0].expires_at })
})

app.get('*', async (req, res) => {
    return res.status(404).json({ message: 'Route not found' })
})

app.listen(process.env.port, () => {
    logger.info("Uruchomiono serwer na porcie " + process.env.port)
})