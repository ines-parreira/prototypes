import type { View } from '@gorgias/helpdesk-types'

import { INBOX_SYSTEM_VIEW_NAME } from '../constants'
import { getSystemViews } from '../hooks/useSystemViews'
import { getAllViews } from '../store/viewStore'
import { getViewIdFromUrl, isInboxViewRootUrl } from './url'

export function getActiveViewIdFromUrl(): number | null {
    const explicitViewId = getViewIdFromUrl()
    if (explicitViewId !== null) return explicitViewId

    if (!isInboxViewRootUrl()) return null

    return getInboxViewId()
}

function getInboxViewId(): number | null {
    const inboxView =
        getSystemViews().find(isInboxView) ??
        getAllViews().find(
            (view) => view.category === 'system' && isInboxView(view),
        )
    return inboxView?.id ?? null
}

function isInboxView(view: View): view is View & { id: number } {
    return view.id != null && view.name === INBOX_SYSTEM_VIEW_NAME
}
