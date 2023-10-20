import classnames from 'classnames'
import React, {ForwardedRef, forwardRef, HTMLProps, ReactNode} from 'react'

import css from './TableBodyRow.less'

type Props = HTMLProps<HTMLTableRowElement> & {
    children: ReactNode
    className?: string
    onClick?: () => void
}

function TableBodyRow(
    {children, className, onClick, ...otherProps}: Props,
    ref: ForwardedRef<HTMLTableRowElement>
) {
    return (
        <tr
            {...otherProps}
            ref={ref}
            className={classnames(css.row, className, {
                [css.isClickable]: !!onClick,
            })}
            onClick={onClick}
        >
            {children}
        </tr>
    )
}

export default forwardRef<HTMLTableRowElement, Props>(TableBodyRow)
