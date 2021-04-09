import React, {type Node} from 'react'

import css from './CardHeaderStatusLabel.less'

type Props = {
    children: Node,
}

export function CardHeaderStatusLabel({children}: Props) {
    return children ? (
        <span className={css.container}>
            <span className={`material-icons ${css.stars}`}>star_rate</span>
            <span className={css.children}>{children}</span>
        </span>
    ) : null
}
