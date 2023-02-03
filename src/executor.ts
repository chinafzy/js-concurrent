import { NowOrPromiseSupplier } from './common-types'
import { sleep } from './fns'
import WeightedQueue from './weighted-queue'

type TaskItem = {
  resolve: (v?: unknown) => void
  reject: (v?: unknown) => void
  name?: string
}

const failAlways = (_err: unknown, _count: number) => -1

const DEFAULT_WEIGHT = 1000

type ExecuteOpts = {
  failStrategy?: FailStrategy
  weight?: number
}

type ExecutorOpts = ExecuteOpts & {
  name?: string
  queueSize?: number
}

class Executor {
  con: number
  opts: ExecutorOpts
  /**
   * task queue
   */
  _q: WeightedQueue<TaskItem>
  /**
   * running count
   */
  _rc = 0 // running count

  static _ins_c = 0 // instance count.

  constructor(
    con = 1,
    opts: ExecutorOpts = {
      failStrategy: failAlways,
      queueSize: 100000,
      weight: DEFAULT_WEIGHT,
    },
  ) {
    this.con = con
    this.opts = opts
    this._q = new WeightedQueue(opts.queueSize, opts.weight)

    Executor._ins_c++
    if (!opts.name) opts.name = `Executor_${Executor._ins_c}`
  }

  async execute<T>(task: NowOrPromiseSupplier<T>, opts: ExecuteOpts = {}): Promise<T> {
    const wrappedFn = async () => {
      this._rc++
      // console.log(`${this._c}`)
      try {
        let times = 0
        while (true) {
          try {
            let ret = task()
            if (ret instanceof Promise) ret = await ret

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
        this._onRelease()
      }
    }

    // call directly
    if (this._rc < this.con) return await wrappedFn()

    const p = new Promise((resolve, reject) => {
      const ret = this._q.add(
        {
          reject,
          resolve,
        },
        opts.weight || this.opts.weight || DEFAULT_WEIGHT,
      )

      if (!ret) reject(`full-queue-size: ${this._q.capacity}`)
    })

    return p.then(wrappedFn)
  }

  _onRelease() {
    // console.log(`${this.name} on_release`)
    this._rc--

    const trigger = this._q.poll()
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
//    * @returns < 0 means stop retrying; 0 means retry immediately; RET > 0 means wait RET ms and then retry.
//    */
//   (/** hahah*/ err: any, tryCount: number): number
// }

/**
 * Test
 *
 * @param err
 * @param tryCount
 * @returns RET<0 means stop retrying; RET==0 means retry immediately; RET > 0 means wait RET ms and then retry.
 */
export type FailStrategy = (err: unknown, tryCount: number) => number

// eslint-disable-next-line @typescript-eslint/no-redeclare
export namespace FailStrategy {
  export function retryAlways(maxTries: number, waitMs?: number): FailStrategy {
    return (_err: unknown, tryCount: number) => (tryCount < maxTries ? waitMs : -1)
  }

  export function failAlways(): FailStrategy {
    return (_err: unknown, _tryCount: number) => -1
  }

  export function retryOnWhiteWords(words: string[], maxTries: number, waitMs?: number): FailStrategy {
    return (err: unknown, tryCount: number) => {
      if (tryCount >= maxTries) return -1

      const errStr = err + ''
      if (!words.some((word) => errStr.indexOf(word) > -1)) return -1

      return waitMs
    }
  }
}
