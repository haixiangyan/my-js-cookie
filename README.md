# 造一个 js-cookie 轮子

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/db9fe0d6cfc249988ce86d0da2e6701c~tplv-k3u1fbpfcp-zoom-1.image)

> 项目源码：https://github.com/Haixiang6123/my-js-cookie
>
> 预览链接：http://yanhaixiang.com/my-js-cookie/
>
> 参考轮子：https://www.npmjs.com/package/js-cookie

Cookie 相信大家都不陌生，但是很多时候我们都是这样：“啊，我这个地方要用 Cookie 了，怎么办？没事，装一个 npm 包嘛”，或者去 MDN 去抄一两个函数。没什么机会手写一个 js-cookie 的库，今天就带大家一起来写一个 js-cookie 的小库。

## 从零开始

首先，我们要摒弃所有所谓的“设计模式”，做一个最 Low 的版本：只有 `get(key)`、`set(key, value)` 和 `del(key)` 3 个 API。

通过对 MDN、菜鸟教程、掘金博客的大量阅读，很快就写出了最简单的 API。

### get

`document.cookie` 长这样：`a=1&b=2`。将 `document.cookie` 字符串转化成 Object，在转化过程中判断是否存在对应的 key，如果有就返回对应的 value 即可。

```ts
function get(key: string): string | null {
  const cookiePairs = document.cookie ? document.cookie.split('; ') : []

  const cookieStore: Record<string, string> = {}

  cookiePairs.some(pair => {
    const [curtKey, ...curtValues] = pair.split('=')

    cookieStore[curtKey] = curtValues.join('=') // 有可能 value 存在 '='

    return curtKey === key // 如果相等时，就会 break
  })

  return key ? cookieStore[key] : null
}
```

**注意：cookie 的值有可能里会有 '=' 号，所以`split('=')` 后的，还要再 `join('=')` 一下变回原来的值。比如：`a=123=456`，join 后的 value 还是 `123=456`而不是 `123`。**

### set

单纯 set 或 add 一个 cookie 更简单，只需要

```ts
document.cookie = `${key}=${value}`
```

但其实，一个 cookie 不只有 key 和 value，还有 expires 过期时间以及 path 路径。一个完整的 set 应该长这样。

```ts
document.cookie = `${key}=${value}; expires=${expires}; path=${path}`
```

当然，我们不希望 set 函数的入参变得很冗余，所以这里的入参设计为：`key`, `value`, `attributes` 3 个。其中，`attributes` 是个对象，里面为 cookie 的属性：expires, path。

```ts
interface Attributes {
  path: string; // Cookie 对应路径
  expires?: string | number | Date // Cookie 的过期时间，第N天过期
}
```

为了提高扩展性，我们再造一个 `defaultAttributes` 作为默认参数传入。

```ts
const TWENTY_FOUR_HOURS = 864e5
const defaultAttributes: Attributes = {path: '/'}

function set(key: string, value: string, attributes = defaultAttributes): string | null {
  attributes = {...defaultAttributes, ...attributes}

  if (attributes.expires) {
    // 将过期天数转为 UTC string
    if (typeof attributes.expires === 'number') {
      attributes.expires = new Date(Date.now() + attributes.expires * TWENTY_FOUR_HOURS)
      attributes.expires = attributes.expires.toUTCString()
    }
  }

  // 获取 Cookie 其它属性的字符串形式，如 "; expires=1; path=/"
  const attrStr = Object.entries(attributes).reduce((prevStr, attrPair) => {
    const [attrKey, attrValue] = attrPair

    if (!attrValue) return prevStr

    prevStr += `; ${attrKey}`

    // attrValue 有可能为 truthy，所以要排除 true 值的情况
    if (attrValue === true) return prevStr

    // 排除 attrValue 存在 ";" 号的情况
    prevStr += `=${attrValue.split('; ')[0]}`

    return prevStr
  }, '')

  return document.cookie = `${key}=${value}${attrStr}`
}
```

上面的操作也非常简单。首先对 expires 做了转成 UTC 时间戳的处理，然后把 `attributes` 拍扁成一个 string，最后追加到 `${key}=${value}` 后面。

**这里可能有人会对这段神秘代号 `864e5` 感兴趣。这是 24 小时的毫秒值，具体可见 [Stackoverflow](https://stackoverflow.com/questions/18359401/javascript-date-gettime-code-snippet-with-mysterious-additional-characters)** 。

### del

删除一个 cookie 一件再简单不过的事了。上面不是已经实现了 `set` 了么，我们把 expires 设置为 -1 天就好了。

```ts
/**
 * 删除某个 Cookie
 */
function del(key: string, attributes = defaultAttributes) {
  // 将 expires 减 1 天，Cookie 自动失败
  set(key, '', {...attributes, expires: -1})
}
```

## 编码与解码

虽然没人要求 cookie 要做编码与解码，但是为了更 cookie 不受一些特殊字符的干扰，我们还要需要对 cookie 的值做编码与解码的工作。

这里普及一下：对于 cookie 的行为是有规范，从 [RFC 2109](http://www.ietf.org/rfc/rfc2109.txt) 到 [RFC 2965](http://www.ietf.org/rfc/rfc2965.txt) 再到 [RFC6265](http://www.ietf.org/rfc/rfc6265.txt)。有兴趣的可以看一看。好的，我知道你没有兴趣了。

咳咳，回到代码。这一步需要在 set 里做编码，在 get 里做解码。一般来说，习惯用 encodeURIComponent 和 decodeURIComponent 做编码和解码的工作。

```ts
function get(key: string): string | null {
  ...

  cookiePairs.some(pair => {
    const [curtKey, ...curtValue] = pair.split('=')

    try {
      // 解码
      const decodeedValue = decodeURIComponent(curtValue.join('='))  // 有可能 value 存在 '='
      cookieStore[curtKey] = decodeedValue
    } catch (e) {}

    return curtKey === key // 如果相等时，就会 break
  })

  return key ? cookieStore[key] : null
}

function set(key: string, value: string, attributes = defaultAttributes): string | null {
  ...
  
  // 编码
  value = encodeURIComponent(value)

  ...

  return document.cookie = `${key}=${value}${attrStr}`
}
```

so easy ~ 不过，上面的 `encodeURIComponent` 和 `decodeURIComponent` 有点像硬编码一样写在了代码里了，不妨抽象出来用 `defaultConverter` 来封装编码和解码两个操作。

```ts
export interface Converter {
  encode: (text: string) => string // 编码
  decode: (text: string) => string // 解码
}

// 默认 Cookie 值的转换器
export const defaultConverter: Converter = {
  encode(text: string) {
    return text.replace(ASCII_HEX_REGEXP, encodeURIComponent)
  },
  decode(text: string) {
    return text.replace(ASCII_HEX_REGEXP, decodeURIComponent)
  },
}
```

set 和 get 函数将会更抽象了。

```ts
function get(key: string): string | null {
  ...
      // 解码
      const decodeedValue = defaultConverter.decode(curtValue.join('='))  // 有可能 value 存在 '='
  ...
}

function set(key: string, value: string, attributes = defaultAttributes): string | null {
  ...
  // 编码
  value = defaultConverter.encode(value)
  ...
}
```

## 配置中心

上面只是“我们觉得”习惯上会用 `encodeURIComponent` 和 `decodeURIComponent` 来编码和解码。别人可能会用别的编码和解码函数来完成，因此需要提供一个配置中心给开发者。一次配置，以后都会按照初始设置来 `set` 和 `get` 。

像下面的例子，初始时设定 expires 为 1 天，以后直接 `set(xxx, yyy)` 设置 Cookie 过期时间都是 1 天后。

```ts
// 初始配置
Cookies.atributes = { expires: 1 }
Cookies.converter = {
  encode(text: string) {
    return "hello"
  },
  decode(text: string) {
    return "world"
  },
}

Cookies.set('aaa', 111) // 过期时间为 1 天，值 aaa="hello"
Cookies.set('bbb', 222) // 过期时间为 1 天，值 bbb="hello"

Cookies.get('aaa') // "world"
Cookies.get('bbb') // "world"
```

要实现上面的效果，我们需要首先提供一个初始配置中心的入口，然后暴露配置中心。而且还需要将 attributes 和 converter 配置存下来。

```ts
let customAttributes: Attributes = defaultAttributes
let customConverter: Converter = defaultConverter

function get(key: string): string | null {
  ...
  const decodedValue = customConverter.decode(curtValue.join('='))  // 有可能 value 存在 '='
  ...
}

/**
 * 设置 Cookie key-val 对
 */
function set(key: string, value: string, attributes = defaultAttributes): string | null {
  attributes = {...customAttributes, ...attributes}
  
  ...

  value = customConverter.encode(value)
  ...
}

/**
 * 删除某个 Cookie
 */
function del(key: string, attributes = defaultAttributes) {
  // 将 expires 减 1 天，Cookie 自动失败
  set(key, '', {...attributes, expires: -1})
}

const Cookies = {
  get,
  set,
  del,
  attributes: customAttributes,
  converter: customConverter,
}

export default Cookies
```

上面导出了一个函数，每次使用 attributes 的时候都会先和 `customAttributes` 合并，每次编码解码的时候会使用 `customCoverter`。

上面这么实现在使用的时候会很麻烦，每次修改配置就要手动去做合并。

```ts
Cookies.attributes = {...Cookies.attributes, ...{ expires: 2 } }
```

那我们想：好吧，暴露两个函数做合并呗。

```ts
...
function withAttributes(myAttributes: Attribute) {
  customAttributes = {...customAttributes, ...myAttributes}
}
function withAttributes(myConverter: Converter) {
  customConverter = {...customConverter, ...myConverter}
}

const Cookies = {
  get,
  set,
  del,
  withAttributes,
  withConverter
}

export default Cookies
```

还有没有问题？有！把 `customAttributes` 和 `customConverter` 放到全局很容易造成污染。想象一下，这个项目很大，有人偷偷把 `customAttributes` 里的 expires 改成 3 天，下个要开发的人可能完全不知情。所以，把这配置项改为局部是十分有必要的。

直接给出实现：

```ts
function init(initConverter: Converter, initAttributes: Attributes) {
  function get(key: string): string | null {
    ...
    const decodeedValue = initConverter.decode(curtValue.join('='))
    ...
  }

  function set(key: string, value: string, attributes = customAttributes): string | null {
    ...
    attributes = {...initAttributes, ...attributes}
    value = initConverter.encode(value)
    ...
  }

  function del(key: string, attributes = customAttributes) {
    set(key, '', {...attributes, expires: -1})
  }

  function withConverter(customConverter: Converter) {
    return init({...this.converter, ...customConverter}, this.attributes)
  }

  function withAttributes(customAttributes: Attributes) {
    return init(this.converter, {...this.attributes, ...customAttributes})
  }

  return {
    get,
    set, 
    del, 
    attributes: initAttributes,
    converter: initConverter, 
    withAttributes,
    withConverter
  }
}

export default init(defaultConverter, defaultAttributes)
```

上面把配置项存放到了生成对象的 `attributes` 和 `converter` 里了。调用 `withConverter`，`withAttributes` 的时候，再次调用 `init` 来创建 Cookies 对象。好处是 withXXX 后是一个全新的对象，不会造成全局污染。

```ts
const myCookies = Cookies.withAttributes({ expires: 2 }) // 新对象

attrCookies.set('aaa', 1) // 2 天后过期

Coookies.set('aaa', 1) // 没有过期时间
```

## 把配置项“冻结”

上面的代码还有个问题，`attributes` 和 `converter` 还是被暴露了出来，万一哪个憨憨手抖改了，后面的接盘侠还是会傻眼。

这里可以用 `Object.create` 来生成对象，并在第 2 个参数里用 `Object.freeze` 把对象 `atributes` 和 `converter`“冻住”。

```ts
function init(initConverter: Converter, initAttributes: Attributes) {
  ...

  return Object.create(
    {get, set, del, withConverter, withAttributes},
    {
      converter: {value: Object.freeze(initConverter)}, // 被冻动了
      attributes: {value: Object.freeze(initAttributes)}, // 被冻动了
    }
  )
}

export default init(defaultConverter, defaultAttributes)
```

关于 `Object.create` 第 2 个参数的内容可以看 [Object.defineProperties](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperties)，它的意义是描述对象属性，这里的描述就是“冻动”了。比如：

```ts
Cookies.attributes = 1

console.log(Cookies.attributes) // 返回依然是 {path: '/'}，不会变成 1
```

到此，一个 js-cookie 库已经完美实现了！

## 总结

用 `init` 函数创建对象，对象里有以下函数
1. get 函数：将 `document.cookie` 字符串转化为 Object 形式，转化过程中判断是否在存 key，如果有就返回对应 value
2. set 函数：把 `attributes` stringify，然后追加到 key=value 后， `document.cookie = ${key}=${value}${attrStr}`
3. del 函数：调用 `set`，把 expires 设置为 -1 天，cookie 直接过期被删除
4. withAttributes：更新 attributes 配置，并返回全新 Cookie 对象
5. withConverter：更新 converter 配置，并返回全新 Cookie 对象

为什么要用函数生成对象这么麻烦？因为要解决全局污染的问题。需要把 `attributes` 和 `converter` 两个配置存到函数参数里，并且通过 `withAttributes` 和 `withConverter` 调用 `init` 返回新 Cookie 对象。

为什么要冻动 `attributes` 和 `converter`，还是因为怕有憨憨把这两玩意改了。

## 最后

上面的代码其实就是 [js-cookie](https://www.npmjs.com/package/js-cookie) 的核心代码了。

当然这个库里对一些特殊字符处理的代码没有过多提及，因为纠结这些过于细节的代码意义并不大。而且上面已经做了一些特殊字符处理了，已经涵盖大部分使用情况了。
