import React, {HTMLProps, MouseEvent, ReactNode} from 'react'
import classNames from 'classnames'

import css from './BodyCell.less'
import BodyCellContent from './BodyCellContent'

export type Props = Omit<HTMLProps<HTMLTableDataCellElement>, 'size'> & {
    children?: ReactNode
    className?: string
    isHighlighted?: boolean
    innerClassName?: string
    innerStyle?: React.CSSProperties
    justifyContent?: 'left' | 'right' | 'center'
    ['data-testid']?: string
    size?: 'normal' | 'small' | 'smallest'
    width?: number | string
    onClick?: (event: MouseEvent<HTMLTableDataCellElement>) => void
}

const BodyCell = React.forwardRef<HTMLTableDataCellElement, Props>(
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
            ['data-testid']: dataTestId,
            ...otherProps
        }: Props,
        ref
    ) => {
        return (
            <td
                {...otherProps}
                ref={ref}
                data-testid={dataTestId}
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
