const express = require("express")
const simpllog = require("simpllog")
const axios = require("axios")


const Logger = new simpllog({ production: false });
const port = 6160

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

const app = express()

app.get('/', (req, res) => {
    res.send('GET request to the homepage')
})

app.get('/api/:userID', async (req, res) => {
    try {
        if (!req.params.userID.match(/^[0-9]{15,25}$/)) {
            res.status(400).json({ status: 400, error: "invalid_user_id" })
            return
        }
        
        const { data } = await axios.get(`https://api.lanyard.rest/v1/users/${req.params.userID}`, { validateStatus: false })

        if (!data.success) {
            res.status(502).json({ status: 502, error: data.error.code ? data.error.code : "unknown_error" })
            return
        }

        res.json({
            schemaVersion: 1,
            label: "Discord",
            message: capitalize(data.data.discord_status),
        })
    } catch (err) {
        Logger.log(err, "ERROR")
        res.status(500).json({ status: 500, error: "unknown_error" })
    }
})

app.use((req, res, next) => {
    res.status(404).json({ status: 404 })
})

app.listen(port, () => Logger.log(`Started server on port ${port}!`, "SUCCESS"));