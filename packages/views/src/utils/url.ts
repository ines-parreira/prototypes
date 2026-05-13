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

/**
 * Returns true for the inbox surface URLs that have no explicit view ID:
 * `/app`, `/app/`, `/app/views(/)`, `/app/tickets(/)`. The helpdesk renders
 * the default inbox view on all of these, so recent-view tracking treats
 * them as "viewing the fallback view" — used to populate the LRU even when
 * the URL doesn't pin a specific view.
 */
export function isInboxRootUrl(): boolean {
    return INBOX_ROOT_PATTERN.test(window.location.pathname)
}

const VIEW_URL_PATTERN = /\/(?:views|app\/tickets)(?:\/(\d+))?/
const INBOX_ROOT_PATTERN = /^\/app(?:\/(?:views|tickets)\/?)?\/?$/
