const bodyParser = require('body-parser')
const helmet = require('helmet')
const fs = require('fs')
require('dotenv').config()

type Middleware = (a, b, c) => void

export interface CORSConfig {
  readonly CORSOrigin?: String;
  readonly CORSAllowHeaders?: String;
  readonly CORSAllowMethod?: String;
}

export interface HttpsConfig {
  readonly privkey?: String;
  readonly cert?: String;
  readonly fullchain?: String;
}

export interface FuelConfig {
  readonly CORS?: CORSConfig;
  readonly https?: HttpsConfig;
  readonly ws?: Boolean;
}

const makeServerSettings = (config: HttpsConfig) => ({
  key: fs.readFileSync(config.privkey),
  cert: fs.readFileSync(config.cert),
  ca: fs.readFileSync(config.fullchain)
})

const makeCORSMiddleware = (config: CORSConfig): Middleware => (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', config.CORSOrigin || '*')
  res.setHeader('Access-Control-Allow-Headers', config.CORSAllowHeaders || 'x-access-token,Content-Type,Accept')
  res.setHeader('Access-Control-Allow-Methods', config.CORSAllowMethod || 'POST')
  next()
}
const setupCORS = (app, config: FuelConfig): Middleware => config.CORS ? makeCORSMiddleware(config.CORS) : null
const send200 = res => {
  res.status(200)
  res.send()
}
const isOptionMethod = (req: any): Boolean => req.method == 'OPTIONS'
const makeOptionHackMiddleware = (): Middleware => (req, res, next) => isOptionMethod(req) ? send200(res) : next()
const createServer = (app: any, config: FuelConfig) => config.https
  ? require('https').createServer(makeServerSettings(config.https), app)
  : require('http').createServer(app)


export const fuel = (app, config: FuelConfig) => {

  [
    setupCORS(app, config),
    makeOptionHackMiddleware(),
    bodyParser.json(),
    helmet(),
    bodyParser.urlencoded({ extended: true })
  ]
    .filter(x => x)
    .forEach(x => app.use(x))

  const server = createServer(app, config)

  if (config.ws) {
    require('express-ws')(app, server)
  }

  return app
}