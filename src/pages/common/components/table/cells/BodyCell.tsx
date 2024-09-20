import React, {forwardRef, HTMLProps, MouseEvent, ReactNode} from 'react'
import classNames from 'classnames'

import css from './BodyCell.less'
import BodyCellContent from './BodyCellContent'

export type Props = Omit<HTMLProps<HTMLTableCellElement>, 'size'> & {
    children?: ReactNode
    className?: string
    isHighlighted?: boolean
    innerClassName?: string
    innerStyle?: React.CSSProperties
    justifyContent?: 'left' | 'right' | 'center'
    size?: 'normal' | 'small' | 'smallest'
    width?: number | string
    onClick?: (event: MouseEvent<HTMLTableCellElement>) => void
}

const BodyCell = forwardRef<HTMLTableCellElement, Props>(
    (
        {
            children,
            className,
            isHighlighted = false,
            innerClassName,
            innerStyle,
            justifyContent,
            onClick,
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
                onClick={onClick}
                width={width}
            >
                <BodyCellContent
                    className={innerClassName}
                    width={width}
                    justifyContent={justifyContent}
                    style={innerStyle}
                >
                    {children}
                </BodyCellContent>
            </td>
        )
    }
)

export default BodyCell
