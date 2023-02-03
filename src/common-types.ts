/**
 * 数据转换器
 */
export type Transformer<S, T> = (source: S) => T

/**
 *
 */
export type Predicate<T> = Transformer<T, boolean>

/**
 * 消费者
 */
export type Consumer<T> = (v: T) => void

/**
 * 数据提供者
 */
export type Supplier<T> = () => T

export type PromiseSupplier<T> = Supplier<Promise<T>>

/**
 * 提供一个数据，或者一个Promise
 */
export type NowOrPromiseSupplier<T> = Supplier<T | Promise<T>>
