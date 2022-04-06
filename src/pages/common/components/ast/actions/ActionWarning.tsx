import classnames from 'classnames'
import React, {ReactNode} from 'react'

import css from './ActionWarning.less'

type Props = {
    children: ReactNode
}

export default function ActionWarning({children}: Props) {
    return (
        <span className={classnames('alert-warning', css.wrapper)}>
            {children}
        </span>
    )
}
