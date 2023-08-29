import React, {HTMLProps, ReactNode} from 'react'
import classNames from 'classnames'

import css from './BodyCell.less'
import BodyCellContent from './BodyCellContent'

export type Props = Omit<HTMLProps<HTMLTableDataCellElement>, 'size'> & {
    children?: ReactNode
    className?: string
    isHighlighted?: boolean
    innerClassName?: string
    justifyContent?: 'left' | 'right' | 'center'
    size?: 'normal' | 'small' | 'smallest'
    width?: number | string
}

const BodyCell = React.forwardRef<HTMLTableDataCellElement, Props>(
    (
        {
            children,
            className,
            isHighlighted = false,
            innerClassName,
            justifyContent,
            size = 'normal',
            width,
            ...otherProps
        }: Props,
        ref
    ) => {
        return (
            <td
                {...otherProps}
                ref={ref}
                className={classNames(css.wrapper, className, css[size], {
                    [css.highlight]: isHighlighted,
                })}
            >
                <BodyCellContent
                    className={innerClassName}
                    width={width}
                    justifyContent={justifyContent}
                >
                    {children}
                </BodyCellContent>
            </td>
        )
    }
)

export default BodyCell
