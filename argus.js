import { defineStore } from 'pinia'

export const useCounterStore = defineStore('aristotleStore', {
  state: () => {
    return {
        tokens: {
            refresh: "",
            access: "",
        },
        mdr: {
            url: "",
        },
        thing: "stuff",
    }
  }
})

export function storeTokens (mdr) {
  let data = encodeURIComponent(JSON.stringify(mdr))
  document.cookie = `argusapp=${data}; SameSite=Strict; Secure"`
}

export function retrieveTokens (defaultURL) {
  const cookieValue = document.cookie.split("; ").find((row) => row.startsWith("argusapp="))?.split("=")[1];
  if (cookieValue) {
    return JSON.parse(decodeURIComponent(cookieValue))
  }
  return {"url": defaultURL}
}