require('dotenv').config()
const got = require('got')
const fs = require('node:fs/promises')
const { parse, stringify } = require('envfile')
const sourcePath = '.env'
let expired = true

// https://stackoverflow.com/a/69058154/1413302
const isTokenExpired = (token) => (Date.now() >= JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).exp * 1000)

/**
 * Use the privately stored refresh token to generate a new access token for
 * your RERUM-connected application. There is no way to authenticate this 
 * process, so protect your refresh token and replace it if it is exposed. 
 */
async function generateNewAccessToken() {
    try {
        const tokenObject = await got.post(process.env.RERUM_ACCESS_TOKEN_URL, {
            timeout: 10000,
            json: { "refresh_token": process.env.REFRESH_TOKEN }
        }).json()
        process.env.ACCESS_TOKEN = tokenObject.access_token
        try {
            const data = await fs.readFile('./.env', { encoding: 'utf8' })
            // Please note that this parse() will remove all #comments in the .env file.
            let env_file_obj = parse(data)
            env_file_obj.ACCESS_TOKEN = tokenObject.access_token
            await fs.writeFile('./.env', stringify(env_file_obj))
            console.log("TinyPen now has an updated access token.")
        }
        catch (env_error) {
            console.error("Could not write new token property to the file.  The access token has not been updated.")
            console.error(env_error)
        }
    }
    catch (err) {
        console.error("Access token not updated: ", err)
    }
}

/**
 * This will conduct a simple check against the expiry date in your token.
 * This does not validate your access token, so you may still be rejected by 
 * your RERUM instance as unauthorized.
 */
if (isTokenExpired(process.env.ACCESS_TOKEN)) {
    console.log("TinyPen detected an expired access token.  Updating the token now.")
    generateNewAccessToken()
}
