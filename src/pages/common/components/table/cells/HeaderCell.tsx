import classnames from 'classnames'
import React, {HTMLProps, ReactNode} from 'react'

import css from './HeaderCell.less'

type Props = Omit<HTMLProps<HTMLTableDataCellElement>, 'size'> & {
    children?: ReactNode
    className?: string
    onClick?: () => void
    justifyContent?: 'left' | 'right' | 'center'
    size?: 'normal' | 'small' | 'smallest'
    width?: number | string
}

export default function HeaderCell({
    children,
    className,
    onClick,
    size = 'normal',
    ...otherProps
}: Props) {
    return (
        <td
            {...otherProps}
            className={classnames(
                css.wrapper,
                className,
                {
                    'is-clickable': !!onClick,
                },
                css[size]
            )}
            onClick={onClick}
        >
            {children}
        </td>
    )
}
