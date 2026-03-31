import type { ReactNode } from 'react'

import { sanitizeHtmlDefault } from '@repo/utils'

type TicketMessageErrorTitleProps = {
    error: ReactNode
    title?: string
}

export function TicketMessageErrorTitle({
    error,
    title,
}: TicketMessageErrorTitleProps) {
    if (typeof error !== 'string') {
        return error
    }

    if (!title) {
        return undefined
    }

    return (
        <span
            dangerouslySetInnerHTML={{
                __html: sanitizeHtmlDefault(title),
            }}
        />
    )
}
