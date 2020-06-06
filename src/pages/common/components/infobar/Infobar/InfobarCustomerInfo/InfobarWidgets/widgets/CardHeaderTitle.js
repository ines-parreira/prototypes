// @flow

import React, {type Node} from 'react'

import css from './CardHeaderTitle.less'

type Props = {
    children: Node,
}

export function CardHeaderTitle({children}: Props) {
    return (
        <span className={css.container}>
            {children}
        </span>
    )
}
