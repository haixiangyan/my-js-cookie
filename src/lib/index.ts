/**
 * 获取单个 Cookie
 */
import {defaultAttributes, defaultConverter, TWENTY_FOUR_HOURS} from './constants'
import {Attributes, Converter} from './types'

function init(customConverter: Converter, customAttributes: Attributes) {
  function get(key: string): string | null {
    if (typeof document === 'undefined') return null

    const cookiePairs = document.cookie ? document.cookie.split('; ') : []

    const cookieStore: Record<string, string> = {}

    cookiePairs.some(pair => {
      const [curtKey, ...curtValue] = pair.split('=')

      try {
        const decodeedValue = customConverter.decode(curtValue.join('='))  // 有可能 value 存在 '='
        cookieStore[curtKey] = decodeedValue
      } catch (e) {}

      return curtKey === key // 如果相等时，就会 break
    })

    return key ? cookieStore[key] : null
  }

  /**
   * 设置 Cookie key-val 对
   */
  function set(key: string, value: string, attributes = customAttributes): string | null {
    if (typeof document === 'undefined') return null

    attributes = {...customAttributes, ...attributes}

    if (attributes.expires) {
      // 将过期天数转为 UTC string
      if (typeof attributes.expires === 'number') {
        attributes.expires = new Date(Date.now() + attributes.expires * TWENTY_FOUR_HOURS)
        attributes.expires = attributes.expires.toUTCString()
      }
    }

    value = customConverter.encode(value)

    // 获取 Cookie 其它属性的字符串形式
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

  /**
   * 删除某个 Cookie
   */
  function del(key: string, attributes = customAttributes) {
    // 将 expires 减 1 天，Cookie 自动失败
    set(key, '', {...attributes, expires: -1})
  }

  return {
    get,
    set,
    del
  }
}

export default init(defaultConverter, defaultAttributes)
