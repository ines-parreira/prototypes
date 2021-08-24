import React from 'react'

import css from './CardHeaderStarPoints.less'

type Props = {
    value: string
}

export function CardHeaderStarPoints({value}: Props) {
    return (
        <span className={css.container}>
            <span className={`material-icons ${css.stars}`}>stars</span>
            <span className={css.children}>
                {parseFloat(value).toLocaleString()}
            </span>
        </span>
    )
}
