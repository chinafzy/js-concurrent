import WeightedQueue from './weighted-queue'

// let p = new Promise((_resolve, reject) => {
//   setTimeout(reject, 100)
// })
// let p2 = p.then(() => 123)
//  p2.then(v => console.log('p2', v))

test('simple', () => {
  const q = new WeightedQueue<number>(10)

  for (let i = 1; i <= 10; i++) {
    expect(q.add(i)).toBe(true)
    expect(q.size() == i).toBe(true)
  }
  expect(q.add(100)).toBe(false)
  expect(q.size()).toBe(10)

  for (let i = 1; i <= 10; i++) {
    expect(q.poll()).toBe(i)
    expect(q.size()).toBe(10 - i)
  }
  expect(q.poll()).toBe(null)
  expect(q.size()).toBe(0)
})

test('with-priority', () => {
  const q = new WeightedQueue<string>(100, 1000)

  q.add('w100_1', 100)
  q.add('w200_1', 200)
  q.add('w100_2', 100)
  q.add('w200_2', 200)

  expect(q.poll()).toEqual(expect.stringMatching(/^w200_/))
  expect(q.poll()).toEqual(expect.stringMatching(/^w200_/))
  expect(q.poll()).toEqual(expect.stringMatching(/^w100_/))
  expect(q.poll()).toEqual(expect.stringMatching(/^w100_/))
})
