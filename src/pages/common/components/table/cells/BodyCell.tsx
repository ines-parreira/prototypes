import React, {HTMLProps, ReactNode} from 'react'
import classNames from 'classnames'

import css from './BodyCell.less'

type Props = HTMLProps<HTMLTableDataCellElement> & {
    children: ReactNode
    className?: string
    innerClassName?: string
    width?: number | string
}

export default function BodyCell({
    children,
    className,
    width,
    innerClassName,
    ...otherProps
}: Props) {
    return (
        <td {...otherProps} className={className}>
            <div
                className={classNames(css.cellContent, innerClassName)}
                style={{width}}
            >
                {children}
            </div>
        </td>
    )
}
