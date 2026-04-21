export function getViewIdFromUrl(): number | null {
    const match = window.location.pathname.match(VIEW_URL_PATTERN)
    if (match?.[1]) {
        return parseInt(match[1], 10)
    }
    return null
}

export function isViewUrl(): boolean {
    return VIEW_URL_PATTERN.test(window.location.pathname)
}

const VIEW_URL_PATTERN = /\/(?:views|app\/tickets)(?:\/(\d+))?/
