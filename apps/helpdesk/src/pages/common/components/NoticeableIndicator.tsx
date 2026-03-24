import React, { useEffect, useState } from 'react'

import { reportError } from '@repo/logging'
import { addBreadcrumb } from '@sentry/react'

type UnreadCountChangedPayload = {
    detail: {
        value: number
    }
}

export default function NoticeIndicator() {
    const [count, setCount] = useState(0)

    useEffect(() => {
        try {
            void window.noticeable
                .render('widget', window.noticeableWidgetId)
                .then(() => {
                    addBreadcrumb({
                        category: 'noticeable',
                        message: 'widget rendered',
                    })
                })
                .catch((error: Error) => {
                    // https://linear.app/gorgias/issue/COR-1285/error-error-while-retrieving-publication-data-for-project
                    reportError(error)
                })
        } catch (error) {
            // https://linear.app/gorgias/issue/COR-1272/typeerror-windownoticeablerenderthen-is-not-a-function
            reportError(error)
        }

        window.noticeable.on(
            'widget:publication:unread_count:changed',
            window.noticeableWidgetId,
            (e: Record<string, any>) => {
                setCount((e as UnreadCountChangedPayload).detail.value)
                addBreadcrumb({
                    category: 'noticeable',
                    message: 'widget unread_count changed',
                })
            },
        )

        return () => {
            void window.noticeable
                .destroy('widget', window.noticeableWidgetId)
                .then(() => {
                    addBreadcrumb({
                        category: 'noticeable',
                        message: 'widget destroyed',
                    })
                })
        }
    }, [])

    if (count === 0) return null

    return (
        <span
            id="noticeable-widget-notification"
            style={{ visibility: 'visible' }}
        />
    )
}
