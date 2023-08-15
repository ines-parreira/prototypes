import classnames from 'classnames'
import React, {PropsWithChildren} from 'react'

import css from './Card.less'

type Props = PropsWithChildren<{className?: string}>

export default function Card({className, children}: Props) {
    return <div className={classnames(css.wrapper, className)}>{children}</div>
}
