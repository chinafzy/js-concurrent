/**
 * Sleep current thread for some while.
 *
 * E.g. <B><I> await sleep(100) </I></B>
 *
 * @param ms MilliSeconds
 * @returns
 */
import { NowOrPromiseSupplier, PromiseSupplier, Supplier } from './common-types'

export const sleep = (ms: number) => (ms > 0 ? new Promise((resolve) => setTimeout(resolve, ms)) : Promise.resolve(1))

// type Predicate = () => boolean

/**
 * Wait until the predicate function returns true.
 *
 * Sample code:
 * <pre>
 *
 *  let flag = false;
 *  setTimeout(() => flag = true, 1000);
 *  await until(() => flag, -1); // line3
 *  </pre>
 *
 * @param condition
 * @param timeout
 * @param checkInterval
 * @returns
 */
export const until = async (condition: Supplier<boolean>, timeout = -1, checkInterval = 10) => {
  const beginTime = new Date().getTime()

  while (true) {
    // succeed
    if (condition()) return true

    // fail
    if (timeout > 0 && new Date().getTime() - beginTime > timeout) return false

    await sleep(checkInterval)
  }
}

/**
 * Wrap the function into one-by-one mode.
 *
 * @param fn
 * @returns
 */
export function oneByOne<T>(fn: NowOrPromiseSupplier<T>): PromiseSupplier<T> {
  let last = Promise.resolve<T>(null)

  function buildNext() {
    return last
      .catch(() => 1)
      .then(async () => {
        let ret = fn()
        if (ret instanceof Promise) ret = await ret

        return ret
      })
  }

  return () => (last = buildNext())
}

/**
 * Wrap the function into single-share mode.
 *
 *  If multi calls come at the same time, only the first call is executed, and the result is shared by all.
 *
 * @param fn
 * @returns
 */
export function singleShare<T>(fn: NowOrPromiseSupplier<T>): PromiseSupplier<T> {
  let running: Promise<T> = null

  function buildRunning() {
    return new Promise<T>(async (resolve, reject) => {
      try {
        let ret = fn()
        if (ret instanceof Promise) ret = await ret

        resolve(ret)
      } catch (e) {
        reject(e)
      } finally {
        running = null
      }
    })
  }

  return () => (running = running || buildRunning())
}
