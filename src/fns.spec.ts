import { sleep, until, singleShot, singleShare } from './fns'

// import {Fns } from './fns'

// sleep(22)

// sleep()


test('sleep', async () => {
  const stamp1 = new Date().getTime()
  await sleep(100)
  const used = new Date().getTime() - stamp1

  expect(used).toBeGreaterThanOrEqual(100)
})

test('util', async () => {
  let b1 = false,
    stamp1 = new Date().getTime()

  setTimeout(() => {
    b1 = true
  }, 100)

  await until(() => b1, -1, 5)

  const used = new Date().getTime() - stamp1

  expect(b1).toBe(true)
  expect(used).toBeGreaterThanOrEqual(100)
  expect(used).toBeLessThanOrEqual(111)
})

test('singleShot', async () => {
  const interval = 50

  async function task() {
    await sleep(interval)

    // console.log(`now`, new Date(), new Date().getTime())
    return new Date().getTime()
  }
  const single = singleShot(task)

  const ps = []
  for (let i = 0; i < 5; i++) {
    ps.push(single())
  }

  const stamp1 = await ps[0]
  for (let i = 0; i < ps.length; i++) {
    // console.log(`psnow ${i}: ${await ps[i]}`)
    const used = (await ps[i]) - stamp1 - i * interval
    expect(used).toBeGreaterThanOrEqual(i * -1)
    expect(used).toBeLessThanOrEqual(i * 4)
  }
})

test('singleShare', async () => {
  let c = 1
  async function after100() {
    await sleep(100)

    return ++c
  }
  const single = singleShare(after100)

  const ps = []
  for (let i = 0; i < 3; i++) {
    ps.push(single())
  }

  // multi calls at the same time, share one executing and result.
  for (let i = 0; i < ps.length; i++) {
    expect(await ps[i]).toBe(c)
  }

  expect(await single()).toBeGreaterThan(await ps[0])
})
