import React, {ReactNode} from 'react'

import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
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
            <Badge className={css.pill} type={ColorType.DarkGrey}>
                {children}
            </Badge>
        </span>
    )
}
