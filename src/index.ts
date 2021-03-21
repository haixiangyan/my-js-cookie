import Cookies from './lib/index'

const $getForm = document.querySelector<HTMLFormElement>('#getForm')
const $setForm = document.querySelector<HTMLFormElement>('#setForm')
const $delForm = document.querySelector<HTMLFormElement>('#delForm')

const $setKey = document.querySelector<HTMLInputElement>('#setKey')
const $setValue = document.querySelector<HTMLInputElement>('#setValue')

const $getKey = document.querySelector<HTMLInputElement>('#getKey')
const $getValue = document.querySelector<HTMLParagraphElement>('#getValue')

const $delKey = document.querySelector<HTMLInputElement>('#delKey')

const $withAttributes = document.querySelector<HTMLButtonElement>('#withAttributes')

const $cookie = document.querySelector('#cookie')

$setForm.onsubmit = (e) => {
  e.preventDefault()

  const key = $setKey.value
  const value = $setValue.value

  Cookies.set(key, value)

  $cookie.textContent = document.cookie
}

$getForm.onsubmit = (e) => {
  e.preventDefault()

  const key = $getKey.value

  const value = Cookies.get(key)

  $getValue.textContent = value
}

$delForm.onsubmit = (e) => {
  e.preventDefault()

  const key = $delKey.value

  Cookies.del(key)

  $cookie.textContent = document.cookie
}

$withAttributes.onclick = () => {
  Cookies.withAttributes({expires: 3})
}

$cookie.textContent = document.cookie
