

/**
 * Test
 *
 * @param err
 * @param tryCount
 * @returns RET<0 means stop retrying; RET==0 means retry immediatey; RET > 0 means wait RET ms and then retry.
 */
 type FailStrategy = (/** hahah*/ err: any, tryCount: number) => number
export default FailStrategy

// export type Transformer =

// export namespace FailStrategy {
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
// }