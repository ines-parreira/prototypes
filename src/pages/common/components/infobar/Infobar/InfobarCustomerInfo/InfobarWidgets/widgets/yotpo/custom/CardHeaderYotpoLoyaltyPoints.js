// @flow
import React, {type Node} from 'react'

import {Badge} from 'reactstrap'

import css from './CardHeaderYotpoLoyaltyPoints.less'

type Props = {
    children: Node,
    label?: string,
}

export function CardHeaderYotpoLoyaltyPoints({children}: Props) {
    return (
        <span className={css.container}>
            <span className={`material-icons ${css.star}`}>stars</span>
            <span>Loyalty Points</span>

            <Badge pill color="primary" className={css.pill}>
                {parseFloat(children).toLocaleString()}
            </Badge>
        </span>
    )
}
