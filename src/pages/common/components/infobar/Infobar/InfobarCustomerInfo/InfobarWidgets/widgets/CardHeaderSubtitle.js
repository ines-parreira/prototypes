// @flow

import React, {type Node} from 'react'

import css from './CardHeaderSubtitle.less'

type Props = {
    children: Node,
}

export function CardHeaderSubtitle({children}: Props) {
    return <span className={css.container}>{children}</span>
}
