interface Queue<E> {
  add(item: E): boolean
}

/**
 * A queue with weighted members.
 *
 * let q = new WeightQueue();
 * 
 * q.add('weight_100', 100);
 *
 * q.add('weight_200', 200);
 *
 * q.add('weight_201', 200);
 *
 * q.poll() == 200
 *
 * q.poll() == 100
 *
 * q.poll() == 201  //
 *
 */
class WeightedQueue<E> implements Queue<E> {
  capacity: number
  defaultWeight: number
  #m = new Map<number, E[]>()

  constructor(capacity = 10000000, defaultWeight = 1000) {
    this.capacity = capacity
    this.defaultWeight = defaultWeight
  }

  add(item: E, weight?: number): boolean {
    // console.log(`size: ${this.size()}; capacity: ${this.capacity}`)
    if (this.size() >= this.capacity) return false

    if (typeof weight == 'undefined') weight = this.defaultWeight

    let list = this.#m.get(weight)
    if (!list) this.#m.set(weight, (list = []))
    list.push(item)

    // console.log('keys', [...this.#m.keys()])
    // console.log(`weight ${weight}: ${list}`)
    return true
  }

  offer(item: E, weight?: number): boolean {
    return this.add(item, weight)
  }

  poll(): E {
    const kvs = [...this.#m.entries()].sort((item1, item2) => item2[0] - item1[0])

    for (let i = 0; i < kvs.length; i++) {
      const item = kvs[i][1].shift()
      if (typeof item != 'undefined') return item
    }

    return null
  }

  peek(): E {
    const kvs = [...this.#m.entries()].sort((item1, item2) => item2[0] - item1[0])

    for (let i = 0; i < kvs.length; i++) {
      const item = kvs[i][1].slice(0, 1)[0]
      if (typeof item != 'undefined') return item
    }

    return null
  }

  size(): number {
    return [...this.#m.values()].reduce((c, list) => c + list.length, 0)
  }
}

export default WeightedQueue
