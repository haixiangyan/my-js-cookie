import Cookies from './lib/index'

const key = 'name'
const value = 'Jack'

// Display all cookies
console.log('All Cookies', document.cookie)

// Set a cookie, and display all cookies(The new one should be in the document.cookie)
Cookies.set(key, value)
console.log(`Already set cookie: ${key}=${value}`, document.cookie)

// Get a cookie, and display the result
const result = Cookies.get(key)
console.log(`Get ${key} from cookie`, result)

// Delete a cookie, and show all cookies(Should be deleted)
Cookies.del(key)
console.log(`Del ${key} cookie`, document.cookie)
