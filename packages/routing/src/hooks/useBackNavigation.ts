import { useState } from 'react'

import { getPreviousUrl } from '../urlTracking'

function resolveBackHref(fallbackUrl: string): string {
    const previousUrl = getPreviousUrl()

    if (previousUrl) {
        try {
            const url = new URL(previousUrl, window.location.origin)

            if (url.origin === window.location.origin) {
                return url.pathname + url.search + url.hash
            }
        } catch {
            // Fall through to the fallback below.
        }
    }

    return fallbackUrl
}

/**
 * Resolves the "back" destination for a detail/form view.
 *
 * When the user arrived from another page in our app, returns that page (with
 * its pagination/search/filter query string). When there's no in-app page to
 * return to — opened in a new tab, deep link, refresh, or arrived from an
 * external site — returns `fallbackUrl`.
 *
 * The href is snapshotted on mount, so later in-view navigations don't change
 * where "back" goes. Render it as a link's `href`; the app router intercepts
 * the navigation and restores the previous page's state.
 *
 * @param fallbackUrl Where to go when there's no in-app page to return to.
 * @default '/'
 */
export function useBackNavigation(fallbackUrl: string = '/'): string {
    const [href] = useState(() => resolveBackHref(fallbackUrl))

    return href
}
