// import { FailStrategy } from 'dist/executor'
import { sleep } from './fns'
import WeightedQueue from './weighted-queue'

type TaskItem = {
  resolve: (v?: any) => void
  reject: (v?: any) => void
  name?: string
}

const failAways = (_err: any, _count: any) => -1

type ExecuteOpts = {
  failStrategy?: FailStrategy
  transformer?: (item: any) => any
}

type ExecutorOpts = ExecuteOpts & {
  name?: string
  queueSize?: number
}

class Executor {
  con: number
  opts: ExecutorOpts
  #q: WeightedQueue<TaskItem>
  #rc = 0 // running count

  static #ins_c = 0 // instance count.

  constructor(
    con = 1,
    opts: ExecutorOpts = {
      name: '',
      failStrategy: failAways,
      queueSize: 100000,
    },
  ) {
    this.con = con
    this.opts = opts
    this.#q = new WeightedQueue(opts.queueSize)

    Executor.#ins_c++
    if (opts.name) opts.name = `Executor_${Executor.#ins_c}`
  }

  async execute(task: () => any, opts: ExecuteOpts = {}) {
    const wrappedFn = async () => {
      this.#rc++
      // console.log(`${this._c}`)
      try {
        let times = 0
        while (true) {
          try {
            let ret = task()
            if (ret instanceof Promise) ret = await ret
            const transformer = opts.transformer || this.opts.transformer
            if (transformer) ret = transformer(ret)

            return ret
          } catch (e) {
            const failStrategy = opts.failStrategy || this.opts.failStrategy
            const decision = failStrategy(e, ++times)

            if (decision < 0) throw e

            if (decision > 0) await sleep(decision)

            // console.log(`try once more ${times}`, e)
          }
        }
      } finally {
        this.#onRelease()
      }
    }

    // call directly
    if (this.#rc < this.con) return await wrappedFn()

    const p = new Promise((resolve, reject) => {
      const ret = this.#q.add({
        resolve,
        reject,
      })

      if (!ret) reject(`full-queue-size: ${this.#q.capacity}`)
    })

    return p.then(wrappedFn)
  }

  async #onRelease() {
    // console.log(`${this.name} on_release`)
    this.#rc--

    const trigger = this.#q.poll()
    if (trigger) {
      // console.log(`${this.name} find first trigger`)
      trigger.resolve()
    }
  }
}

export default Executor

// type FailStrategy = (err: any, tryCount: number) => number
// type FailStrategy = {
//   description?: string,
//   /**
//    * @param err
//    * @param tryCount
//    * @returns < 0 means stop retrying; 0 means retry immediatey; RET > 0 means wait RET ms and then retry.
//    */
//   (/** hahah*/ err: any, tryCount: number): number
// }




/**
 * Test
 *
 * @param err
 * @param tryCount
 * @returns RET<0 means stop retrying; RET==0 means retry immediatey; RET > 0 means wait RET ms and then retry.
 */
export type FailStrategy = (/** hahah*/ err: any, tryCount: number) => number



export namespace FailStrategy {
  export function retryAlways(maxTries: number, waitMs?: number): FailStrategy {
    return (_err: any, tryCount: number) => (tryCount < maxTries ? waitMs : -1)
  }

  export function failAlways(): FailStrategy {
    return (_err: any, _tryCount: number) => -1
  }

  export function retryOnWhiteWords(words: string[], maxTries: number, waitMs?: number): FailStrategy {
    return (err: string, tryCount: number) => {
      if (tryCount >= maxTries) return -1

      const errStr = err + ''
      if (!words.some((word) => errStr.indexOf(word) > -1)) return -1

      return waitMs
    }
  }
}