import React from 'react'

import css from './CardHeaderStarPoints.less'

type Props = {
    children: string
}

export function CardHeaderStarPoints({children}: Props) {
    return (
        <span className={css.container}>
            <span className={`material-icons ${css.stars}`}>stars</span>
            <span className={css.children}>
                {parseFloat(children).toLocaleString()}
            </span>
        </span>
    )
}
