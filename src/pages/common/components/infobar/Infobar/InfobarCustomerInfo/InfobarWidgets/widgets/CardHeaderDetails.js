// @flow

import React, {type Node} from 'react'

import css from './CardHeaderDetails.less'

type Props = {
    children: Node,
}

export function CardHeaderDetails({children}: Props) {
    return (
        <div className={css.container}>
            {children}
        </div>
    )
}
