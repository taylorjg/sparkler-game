const express = require('express')
const morgan = require('morgan')
const path = require('path')
const log = require('loglevel')

const PORT = process.env.PORT || 3535
const SRC_FOLDER = path.resolve(__dirname, 'public')

const main = () => {
  log.setLevel('info')
  const app = express()
  app.use(morgan('dev'))
  app.use(express.static(SRC_FOLDER))
  app.listen(PORT, () => log.info(`Listening on http://localhost:${PORT}`))
}

main()
