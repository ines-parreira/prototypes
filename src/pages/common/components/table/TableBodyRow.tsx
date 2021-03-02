import classnames from 'classnames'
import React, {HTMLProps, ReactNode} from 'react'

import css from './TableBodyRow.less'

type Props = HTMLProps<HTMLTableRowElement> & {
    children: ReactNode
    className?: string
    onClick?: () => void
}

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
