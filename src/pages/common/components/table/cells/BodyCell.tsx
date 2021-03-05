import React, {HTMLProps, ReactNode} from 'react'

import css from './BodyCell.less'

type Props = HTMLProps<HTMLTableDataCellElement> & {
    children: ReactNode
    className?: string
}

export default function BodyCell({children, className, ...otherProps}: Props) {
    return (
        <td {...otherProps} className={className}>
            <div className={css.cellContent}>{children}</div>
        </td>
    )
}
