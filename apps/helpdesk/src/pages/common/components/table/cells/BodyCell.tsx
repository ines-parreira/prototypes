import React, { forwardRef, HTMLProps, MouseEvent, ReactNode } from 'react'

import classNames from 'classnames'

import { Skeleton } from '@gorgias/axiom'

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
                <BodyCellContent
                    className={innerClassName}
                    width={width}
                    justifyContent={justifyContent}
                    style={innerStyle}
                >
                    {isLoading ? (
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                width: '100%',
                            }}
                        >
                            <Skeleton style={{ flex: 1 }} />
                        </div>
                    ) : (
                        children
                    )}
                </BodyCellContent>
            </td>
        )
    },
)

export default BodyCell
