// Since the FB object might not be yet loaded (it's script is injected on runtime), wait until it's ready
export const waitForFB = (callback) => {
    const interval = setInterval(() => {
        if (typeof FB !== 'undefined') {
            clearInterval(interval)
            callback()
        }
    }, 500)
}
