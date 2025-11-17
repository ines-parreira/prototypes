import type { ReactNode } from 'react'
import React from 'react'

import { LegacyBadge as Badge } from '@gorgias/axiom'

import css from './CardHeaderYotpoReviewStatistics.less'

type Props = {
    children: ReactNode
    label?: string
}

export function CardHeaderYotpoReviewStatistics({ children }: Props) {
    return (
        <span className={css.container}>
            <span className={`material-icons ${css.star}`}>chat_bubble</span>
            <span>Reviews</span>
            <Badge className={css.pill} type="dark-grey">
                {children}
            </Badge>
        </span>
    )
}
