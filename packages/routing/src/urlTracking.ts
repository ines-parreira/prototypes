import { history } from './history'

let previousUrl: string | null = document.referrer || null
let currentUrl: string = window.location.href

// Initialize listener to track navigation
history.listen((location) => {
    previousUrl = currentUrl
    currentUrl =
        window.location.origin +
        location.pathname +
        location.search +
        location.hash
})

export const getPreviousUrl = () => previousUrl
export const getCurrentUrl = () => currentUrl
