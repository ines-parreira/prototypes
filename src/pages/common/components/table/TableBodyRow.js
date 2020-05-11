//@flow
import classnames from 'classnames'
import React, {type Node as ReactNode} from 'react'

import css from './TableBodyRow.less'

type Props = $Exact<{
    ...HTMLTableRowElement,
    children: ReactNode,
    className?: string,
    onClick?: () => void,
}>

export default function TableBodyRow({
    children,
    className,
    onClick,
    ...otherProps
}: Props) {
    return (
        <tr
            {...otherProps}
            className={classnames(css.row, className, {
                [css.isClickable]: !!onClick,
            })}
            onClick={onClick}
        >
            {children}
        </tr>
    )
}
