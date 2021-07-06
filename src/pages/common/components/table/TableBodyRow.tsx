import classnames from 'classnames'
import React, {HTMLProps, ReactNode} from 'react'

import css from './TableBodyRow.less'

type Props = HTMLProps<HTMLTableRowElement> & {
    children: ReactNode
    className?: string
    onClick?: () => void
}

function TableBodyRow(
    {children, className, onClick, ...otherProps}: Props,
    ref: React.Ref<HTMLTableRowElement> | null | undefined
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

export default React.forwardRef(TableBodyRow)
