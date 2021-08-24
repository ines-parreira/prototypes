import React from 'react'
import {Badge} from 'reactstrap'

import css from './CardHeaderYotpoLoyaltyPoints.less'

type Props = {
    value: string
    label?: string
}

export function CardHeaderYotpoLoyaltyPoints({value}: Props) {
    return (
        <span className={css.container}>
            <span className={`material-icons ${css.star}`}>stars</span>
            <span>Loyalty Points</span>

            <Badge pill color="primary" className={css.pill}>
                {parseFloat(value).toLocaleString()}
            </Badge>
        </span>
    )
}
