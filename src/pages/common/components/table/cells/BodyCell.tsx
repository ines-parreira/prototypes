import React, {HTMLProps, ReactNode} from 'react'
import classNames from 'classnames'

import css from './BodyCell.less'
import BodyCellContent from './BodyCellContent'

type Props = Omit<HTMLProps<HTMLTableDataCellElement>, 'size'> & {
    children?: ReactNode
    className?: string
    innerClassName?: string
    width?: number | string
    size?: 'normal' | 'small' | 'smallest'
}

const BodyCell = React.forwardRef<HTMLTableDataCellElement, Props>(
    (
        {
            children,
            className,
            width,
            innerClassName,
            size = 'normal',
            ...otherProps
        }: Props,
        ref
    ) => {
        return (
            <td
                {...otherProps}
                ref={ref}
                className={classNames(css.wrapper, className, css[size])}
            >
                <BodyCellContent className={innerClassName} width={width}>
                    {children}
                </BodyCellContent>
            </td>
        )
    }
)

export default BodyCell
