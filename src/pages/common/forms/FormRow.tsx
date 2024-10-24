import classnames from 'classnames'
import React, {ReactNode} from 'react'

import css from './FormRow.less'

export default function FormRow({
    children,
    className,
}: {
    children: ReactNode
    className?: string
}): JSX.Element {
    return <div className={classnames(css.row, className)}>{children}</div>
}
