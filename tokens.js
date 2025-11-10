import dotenv from "dotenv"
const storedEnv = dotenv.config()
import fs from "node:fs/promises"
import { parse, stringify } from "envfile"

const sourcePath = '.env'

// https://stackoverflow.com/a/69058154/1413302
const isTokenExpired = (token) => (Date.now() >= JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).exp * 1000)

// Track if a token refresh is in progress to prevent concurrent refreshes
let tokenRefreshPromise = null

/**
 * Use the privately stored refresh token to generate a new access token for
 * your RERUM-connected application. There is no way to authenticate this
 * process, so protect your refresh token and replace it if it is exposed.
 * NOTE: This fails without updating or throwing an error.
 * @returns {Promise<string>} The new access token
 */
async function generateNewAccessToken() {
    try {
        const tokenObject = await fetch(process.env.RERUM_ACCESS_TOKEN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ "refresh_token": process.env.REFRESH_TOKEN }),
            timeout: 10000,
        }).then(res => res.json())

        if (!tokenObject.access_token) {
            throw new Error("No access token received from refresh endpoint")
        }

        process.env.ACCESS_TOKEN = tokenObject.access_token

        try {
            const data = await fs.readFile('./.env', { encoding: 'utf8' })
            // Please note that this parse() will remove all #comments in the .env file.
            const env_file_obj = parse(data)
            env_file_obj.ACCESS_TOKEN = tokenObject.access_token
            await fs.writeFile('./.env', stringify(env_file_obj))
            console.log("TinyPEN now has an updated access token.")
        }
        catch (env_error) {
            console.error("Could not write new token property to the file.  The access token has not been updated.")
            console.error(env_error)
        }

        return tokenObject.access_token
    } catch (err) {
        console.error("Access token not updated: ", err)
        throw err
    }
}

/**
 * This will conduct a simple check against the expiry date in your token.
 * This does not validate your access token, so you may still be rejected by
 * your RERUM instance as unauthorized.
 *
 * Prevents concurrent token refreshes by reusing an in-progress refresh promise.
 * @returns {Promise<void>}
 */
async function updateExpiredToken() {
    if (isTokenExpired(process.env.ACCESS_TOKEN)) {
        console.log("TinyPEN detected an expired access token.  Updating the token now.")

        // If a refresh is already in progress, wait for it instead of starting a new one
        if (tokenRefreshPromise) {
            console.log("Token refresh already in progress, waiting for it to complete...")
            await tokenRefreshPromise
            return
        }

        // Start a new token refresh and store the promise
        tokenRefreshPromise = generateNewAccessToken()
            .finally(() => {
                // Clear the promise once complete (success or failure)
                tokenRefreshPromise = null
            })

        await tokenRefreshPromise
    }
    else {
        console.log("TinyPEN token is up to date")
    }
}

export { updateExpiredToken }
