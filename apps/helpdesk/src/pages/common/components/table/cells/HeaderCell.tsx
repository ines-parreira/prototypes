import type { HTMLProps, ReactNode } from 'react'
import React from 'react'

import classnames from 'classnames'

import css from 'pages/common/components/table/cells/HeaderCell.less'

type Props = Omit<HTMLProps<HTMLTableCellElement>, 'size'> & {
    children?: ReactNode
    className?: string
    onClick?: () => void
    justifyContent?: 'left' | 'right' | 'center'
    size?: 'normal' | 'small' | 'smallest'
    width?: number | string
    height?: 'comfortable' | 'compact'
}

export default function HeaderCell({
    children,
    className,
    onClick,
    height,
    size = 'normal',
    ...otherProps
}: Props) {
    return (
        <th
            {...otherProps}
            className={classnames(
                css.wrapper,
                className,
                {
                    [css.isClickable]: !!onClick,
                },
                css[size],
                height && css[height],
            )}
            onClick={onClick}
        >
            {children}
        </th>
    )
}
