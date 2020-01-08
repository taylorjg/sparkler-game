const express = require('express')
const path = require('path')

const PORT = process.env.PORT || 3535
const SRC_FOLDER = path.resolve(__dirname, 'public')

const app = express()
app.use(express.static(SRC_FOLDER))
app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`))
