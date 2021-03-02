import classnames from 'classnames'
import React, {HTMLProps, ReactNode} from 'react'

import css from './TableWrapper.less'

type Props = HTMLProps<HTMLTableElement> & {
    children: ReactNode
    className?: string
}

export default function TableWrapper({
    className,
    children,
    ...otherProps
}: Props) {
    return (
        <table {...otherProps} className={classnames(css.table, className)}>
            {children}
        </table>
    )
}
