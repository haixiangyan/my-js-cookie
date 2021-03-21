import {Attributes} from './types'

// 1000*60*60*24 or 86400000
// 详见：https://stackoverflow.com/questions/18359401/javascript-date-gettime-code-snippet-with-mysterious-additional-characters
export const TWENTY_FOUR_HOURS = 864e5

// 默认 Cookie 属性
export const defaultAttributes: Attributes = {path: '/'}
