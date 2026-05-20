export function getViewIdFromUrl(): number | null {
    if (typeof window === 'undefined') return null

    const match = window.location.pathname.match(VIEW_URL_PATTERN)
    if (match?.[1]) {
        return parseInt(match[1], 10)
    }
    return null
}

export function isViewUrl(): boolean {
    if (typeof window === 'undefined') return false

    return VIEW_URL_PATTERN.test(window.location.pathname)
}

export function isInboxViewRootUrl(): boolean {
    if (typeof window === 'undefined') return false

    return INBOX_VIEW_ROOT_PATTERN.test(window.location.pathname)
}

const VIEW_URL_PATTERN = /\/(?:views|app\/tickets)(?:\/(\d+))?/
const INBOX_VIEW_ROOT_PATTERN = /^\/app\/views\/?$/
