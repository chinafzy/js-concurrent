# API

## Fns

辅助函数集合。

### sleep

用于产生一个暂停时间。

```js
await sleep(100)
```

### until

等待某个条件满足。

```js

let b1 = false

setTimeout(() => {
  b1 = true
}, 100);

// 等待b1变量为true，每10ms检查一次
await until(() => b1, -1, 10)
// 大约100ms后代码到这里
```

### oneByOne

将函数转成`单发模式`，避免并发调用问题。

如果前一次的调用还没有完成，再过来的调用请求会进入排队队列。

```js

```

### singleShare

将函数转成`单发共享模式`，避开并发调用问题。

如果前一次的调用还没有完成，再过来的调用请求会直接等待当前调用的结果。
```ts

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

```

## Executor
