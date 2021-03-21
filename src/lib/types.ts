export interface Attributes {
  path: string; // Cookie 对应路径
  expires?: string | number | Date // Cookie 的过期时间，第N天过期
}

export interface Converter {
  encode: (text: string) => string // 编码
  decode: (text: string) => string // 解码
}
