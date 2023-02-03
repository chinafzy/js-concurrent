import Executor from './executor'
import { sleep } from './fns'

test('complex', async () => {
  const executor = new Executor(2)
  const vs = []

  function sleepAndPut(ms: number, v: unknown) {
    return executor.execute(async () => {
      vs.push(v + '_begin')
      await sleep(ms)
      vs.push(v + '_end')
    })
  }

  await Promise.all([
    sleepAndPut(100, '100_1'), // run first, finish second
    sleepAndPut(50, '50_1'), // run second, finish first
    sleepAndPut(200, '200_1'), // run third, finish last
    sleepAndPut(30, '30_1'),
  ])

  expect(vs).toEqual([
    '100_1_begin', // t1
    '50_1_begin', // t2
    '50_1_end', // t2
    '200_1_begin', // t2
    '100_1_end', // t1
    '30_1_begin', // t1
    '30_1_end', // t1
    '200_1_end', // t2
  ])
})

test('full-queue-size rejection', async () => {
  const executor = new Executor(1, {
    queueSize: 4,
  })

  const ps = []
  for (let i = 0; i < 5; i++) {
    const p = executor.execute(async () => {
      await sleep(100)
    })
    ps.push(p)
  }

  await expect(
    executor.execute(() => {
      throw `never see me here.`
    }),
  ).rejects.toMatch(/full-queue-size.*/)

  await ps[0]
  expect(await executor.execute(() => 3)).toBe(3)
})
