import classnames from 'classnames'
import React, {HTMLProps, ReactNode} from 'react'

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
        <td
            {...otherProps}
            className={classnames(
                css.wrapper,
                className,
                {
                    'is-clickable': !!onClick,
                },
                css[size],
                height && css[height]
            )}
            onClick={onClick}
        >
            {children}
        </td>
    )
}
