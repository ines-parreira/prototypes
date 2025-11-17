import type { PropsWithChildren } from 'react'
import React from 'react'

import css from 'pages/common/components/EmptyState/ImageContainer.less'

export default function ImageContainer({
    children,
}: PropsWithChildren<unknown>) {
    return (
        <div className={css.container}>
            <div className={css.content}>{children}</div>
        </div>
    )
}
