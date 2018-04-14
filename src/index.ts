import * as express from 'express'
import { fuel, FuelConfig } from './functions/fuel'

const config: FuelConfig = {

}
const app = fuel(express(), config)

//Functions

// Actions
import { helloWorld } from './actions/action'

// Bind actions to server events. (request, sockets, timers)
app.get('/', helloWorld)

app.listen(3000, () => console.log('We are online!!! on 3000'))