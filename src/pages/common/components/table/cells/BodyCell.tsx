import React, { forwardRef, HTMLProps, MouseEvent, ReactNode } from 'react'

import classNames from 'classnames'

import { Skeleton } from '@gorgias/merchant-ui-kit'

import { METRIC_COLUMN_WIDTH } from 'pages/aiAgent/insights/IntentTableWidget/IntentTableConfig'
import css from 'pages/common/components/table/cells/BodyCell.less'
import BodyCellContent from 'pages/common/components/table/cells/BodyCellContent'

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
    isLoading?: boolean
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
            isLoading,
            ...otherProps
        }: Props,
        ref,
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
                {isLoading ? (
                    <Skeleton inline width={METRIC_COLUMN_WIDTH} />
                ) : (
                    <BodyCellContent
                        className={innerClassName}
                        width={width}
                        justifyContent={justifyContent}
                        style={innerStyle}
                    >
                        {children}
                    </BodyCellContent>
                )}
            </td>
        )
    },
)

export default BodyCell
