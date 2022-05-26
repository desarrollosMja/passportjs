require("dotenv").config()

const config = {
    PORT: process.env.PORT,
    SECRET_KEY: process.env.SECRET_KEY
}

module.exports = { config }