import classnames from 'classnames'
import React, {HTMLProps} from 'react'

import css from './Card.less'

type Props = HTMLProps<HTMLDivElement>

export default function Card({className, children, ...other}: Props) {
    return (
        <div className={classnames(css.wrapper, className)} {...other}>
            {children}
        </div>
    )
}
