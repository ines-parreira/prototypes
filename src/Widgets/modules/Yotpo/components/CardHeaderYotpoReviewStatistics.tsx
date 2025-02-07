import {Badge} from '@gorgias/merchant-ui-kit'
import React, {ReactNode} from 'react'

import css from './CardHeaderYotpoReviewStatistics.less'

type Props = {
    children: ReactNode
    label?: string
}

export function CardHeaderYotpoReviewStatistics({children}: Props) {
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
