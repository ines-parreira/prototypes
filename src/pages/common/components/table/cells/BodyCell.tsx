import React, {HTMLProps, ReactNode} from 'react'
import classNames from 'classnames'

import css from './BodyCell.less'

type Props = HTMLProps<HTMLTableDataCellElement> & {
    children: ReactNode
    className?: string
    innerClassName?: string
    width?: number | string
}

const BodyCell = React.forwardRef<HTMLTableDataCellElement, Props>(
    (
        {children, className, width, innerClassName, ...otherProps}: Props,
        ref
    ) => {
        return (
            <td {...otherProps} ref={ref} className={className}>
                <div
                    className={classNames(css.cellContent, innerClassName)}
                    style={{width}}
                >
                    {children}
                </div>
            </td>
        )
    }
)

export default BodyCell
