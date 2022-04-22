/**
 * Sleep current thread for some while.
 *
 * E.g. <B><I> await sleep(100) </I></B>
 *
 * @param ms MilliSeconds
 * @returns
 */
export const sleep = (ms: number) => (ms > 0 ? new Promise((resolve) => setTimeout(resolve, ms)) : Promise.resolve(1))

/**
 * Wait until the predicate function returns true.
 *
 * Sample code:
 *
 *  let flag = false;
 *
 *  setTimeout(() => flag = true, 1000);
 *
 *  await until(() => flag, -1); // line3
 *
 * @param predicate
 * @param timeout
 * @param checkInterval
 * @returns
 */
export const until = async (predicate: Function, timeout = -1, checkInterval = 10) => {
  const beginTime = new Date().getTime()

  while (true) {
    // succeed
    if (predicate()) return true

    // fail
    if (timeout > 0 && new Date().getTime() - beginTime > timeout) return false

    await sleep(checkInterval)
  }
}

/**
 * Wrap the function into single-shot mode. If multi calls come at the same time, runs one-by-one.
 *
 * @param fn
 * @returns
 */
export function singleShot(fn: Function): () => Promise<any> {
  let last = Promise.resolve(1)

  return () => {
    return (last = last
      .catch(() => {})
      .then(async () => {
        let ret = fn()
        if (ret instanceof Promise) ret = await ret

        return ret
      }))
  }
}

/**
 * Wrape the function into single-share mode.
 *
 *  If multi calls come at the same time, only the first call is executed, and the result is shared by all.
 *
 * @param fn
 * @returns
 */
export function singleShare(fn: Function): () => Promise<any> {
  let running: Promise<any>

  return () => {
    if (running) return running

    return (running = new Promise(async (resolve, reject) => {
      try {
        let ret = fn()
        if (ret instanceof Promise) ret = await ret
        resolve(ret)
      } catch (e) {
        reject(e)
      } finally {
        running = null
      }
    }))
  }
}
