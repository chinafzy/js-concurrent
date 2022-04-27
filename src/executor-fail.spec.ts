import Executor from './executor'
import { FailStrategy } from './executor'

// function emptyFn(){}

test('fail on white word', async () => {
  const executor = new Executor(2, {
    failStrategy: FailStrategy.retryOnWhiteWords(['retry', 'ok'], 3, 1),
  })

  let c = 0
  function throwOk() {
    c++
    throw 'retry'
  }

  await expect(executor.execute(throwOk)).rejects.toMatch('retry') // fail fianlly, and throws 'retry'
  expect(c).toBe(3) // try 3 times
})
