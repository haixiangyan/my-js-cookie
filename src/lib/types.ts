export interface Attributes {
  path: string; // Cookie 对应路径
  expires?: string | number | Date // Cookie 的过期时间，第N天过期
}
