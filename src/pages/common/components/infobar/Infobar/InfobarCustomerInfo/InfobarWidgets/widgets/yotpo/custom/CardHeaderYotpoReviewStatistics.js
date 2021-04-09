import React, {type Node} from 'react'

import {Badge} from 'reactstrap'

import css from './CardHeaderYotpoReviewStatistics.less'

type Props = {
    children: Node,
    label?: string,
}

export function CardHeaderYotpoReviewStatistics({children}: Props) {
    return (
        <span className={css.container}>
            <span className={`material-icons ${css.star}`}>chat_bubble</span>
            <span>Reviews</span>
            <Badge pill color="primary" className={css.pill}>
                {children}
            </Badge>
        </span>
    )
}
