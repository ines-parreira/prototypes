//@flow
import React, {type Node as ReactNode} from 'react'

import css from './BodyCell.less'

type Props = $Exact<{
    ...HTMLTableCellElement,
    children: ReactNode,
    className?: string,
}>

export default function BodyCell({children, className, ...otherProps}: Props) {
    return (
        <td {...otherProps} className={className}>
            <div className={css.cellContent}>{children}</div>
        </td>
    )
}
