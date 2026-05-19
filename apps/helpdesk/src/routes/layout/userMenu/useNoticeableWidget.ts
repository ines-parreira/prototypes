import { useEffect, useSyncExternalStore } from 'react'

import { reportError } from '@repo/logging'
import { addBreadcrumb } from '@sentry/react'

type UnreadCountChangedPayload = {
    detail: {
        value: number
    }
}

const WIDGET_MOUNT_ID = 'noticeable-widget'

let unreadCount = 0
const subscribers = new Set<() => void>()

function getUnreadCountSnapshot() {
    return unreadCount
}

function subscribeToUnreadCount(onChange: () => void) {
    subscribers.add(onChange)
    return () => {
        subscribers.delete(onChange)
    }
}

function setUnreadCount(value: number) {
    if (value === unreadCount) return
    unreadCount = value
    subscribers.forEach((onChange) => onChange())
}

export function useNoticeableUnreadCount() {
    return useSyncExternalStore(subscribeToUnreadCount, getUnreadCountSnapshot)
}

function ensureMountNode() {
    let node = document.getElementById(WIDGET_MOUNT_ID)
    if (!node) {
        node = document.createElement('div')
        node.id = WIDGET_MOUNT_ID
        document.body.appendChild(node)
    }
    return node
}

let renderPromise: Promise<void> | null = null
let subscribed = false

function ensureRendered(): Promise<void> {
    if (renderPromise) return renderPromise

    try {
        renderPromise = Promise.resolve(
            window.noticeable.render('widget', window.noticeableWidgetId),
        )
            .then(() => {
                addBreadcrumb({
                    category: 'noticeable',
                    message: 'widget rendered',
                })
            })
            .catch((error: Error) => {
                // https://linear.app/gorgias/issue/COR-1285/error-error-while-retrieving-publication-data-for-project
                reportError(error)
                renderPromise = null
                throw error
            })
        return renderPromise
    } catch (error) {
        // https://linear.app/gorgias/issue/COR-1272/typeerror-windownoticeablerenderthen-is-not-a-function
        reportError(error)
        return Promise.reject(error)
    }
}

function subscribeToUnreadCountEvents() {
    if (subscribed) return
    subscribed = true
    window.noticeable.on(
        'widget:publication:unread_count:changed',
        window.noticeableWidgetId,
        (e: Record<string, any>) => {
            setUnreadCount((e as UnreadCountChangedPayload).detail.value)
            addBreadcrumb({
                category: 'noticeable',
                message: 'widget unread_count changed',
            })
        },
    )
}

export function openNoticeableWidget() {
    ensureMountNode()
    if (!window.noticeable) return
    subscribeToUnreadCountEvents()
    ensureRendered()
        .then(() => {
            window.noticeable.do('widget:open', window.noticeableWidgetId)
        })
        .catch(() => {
            // error already reported by ensureRendered
        })
}

export function useNoticeableWidget() {
    useEffect(() => {
        ensureMountNode()
        if (renderPromise || !window.noticeable) return

        subscribeToUnreadCountEvents()
        void ensureRendered().catch(() => {})
    }, [])
}
