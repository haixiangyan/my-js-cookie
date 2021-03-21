import Cookies from './lib/index'

const key = 'name'
const value = 'Jack'

// 显示所有 Cookie
console.log('All Cookies', document.cookie)

// 设置 Cookie，然后展示所有 Cookie
Cookies.set(key, value)
console.log(`Already set cookie: ${key}=${value}`, document.cookie)

// 获取 Cookie，展示结果
const result = Cookies.get(key)
console.log(`Get ${key} from cookie`, result)

// 删除 Cookie，展示所有 Cookie
Cookies.del(key)
console.log(`Del ${key} cookie`, document.cookie)
