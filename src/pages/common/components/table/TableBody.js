//@flow
import classnames from 'classnames'
import React, {type Node as ReactNode} from 'react'

import css from './TableBody.less'

type Props = $Exact<{
    ...HTMLTableSectionElement,
    children: ReactNode,
    className?: string,
}>

export default function TableBody({children, className, ...otherProps}: Props) {
    return (
        <tbody {...otherProps} className={classnames(css.tableBody, className)}>
            {children}
        </tbody>
    )
}
