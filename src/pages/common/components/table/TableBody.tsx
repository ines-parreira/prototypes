import classnames from 'classnames'
import React, {HTMLProps, ReactNode} from 'react'

import css from './TableBody.less'

type Props = HTMLProps<HTMLTableSectionElement> & {
    children: ReactNode
    className?: string
}

export default function TableBody({children, className, ...otherProps}: Props) {
    return (
        <tbody {...otherProps} className={classnames(css.tableBody, className)}>
            {children}
        </tbody>
    )
}
