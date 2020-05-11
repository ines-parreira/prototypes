//@flow
import classnames from 'classnames'
import React, {type Node as ReactNode} from 'react'

import css from './HeaderCell.less'

type Props = $Exact<{
    ...HTMLTableCellElement,
    children?: ReactNode,
    className?: string,
    onClick?: () => void,
}>

export default function HeaderCell({
    children,
    className,
    onClick,
    ...otherProps
}: Props) {
    return (
        <td
            {...otherProps}
            className={classnames(css.wrapper, className, {
                'is-clickable': !!onClick,
            })}
            onClick={onClick}
        >
            {(children: any)}
        </td>
    )
}
