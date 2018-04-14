import { helloWorld } from './action'

it('send a response', () => {
  const sendFunc = jest.fn()
  helloWorld(null, { send: sendFunc })
  expect(sendFunc).toBeCalledWith('Hello Jeppe!')
})