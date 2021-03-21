import {Attributes, Converter} from './types'

// 1000*60*60*24 or 86400000
// 详见：https://stackoverflow.com/questions/18359401/javascript-date-gettime-code-snippet-with-mysterious-additional-characters
export const TWENTY_FOUR_HOURS = 864e5

export const ASCII_HEX_REGEXP = /(%[\dA-F]{2})+/gi

// 默认 Cookie 属性
export const defaultAttributes: Attributes = {
  path: '/'
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
