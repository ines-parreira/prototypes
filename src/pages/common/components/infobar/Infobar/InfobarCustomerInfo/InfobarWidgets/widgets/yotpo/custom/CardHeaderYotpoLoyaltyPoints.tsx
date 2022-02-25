import React from 'react'

import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
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

            <Badge className={css.pill} type={ColorType.DarkGrey}>
                {parseFloat(value).toLocaleString()}
            </Badge>
        </span>
    )
}
