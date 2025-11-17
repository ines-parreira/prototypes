import type { MouseEvent, PropsWithChildren } from 'react'
import type React from 'react'

import { SCREEN_SIZE, useScreenSize } from '@repo/hooks'
import classNames from 'classnames'

import css from 'domains/reporting/pages/common/components/Table/BreakdownTable.less'
import BodyCell from 'pages/common/components/table/cells/BodyCell'

export const EXPAND_COLUMN_WIDTH = 24
export const MOBILE_EXPAND_COLUMN_WIDTH = 10
export const DEFAULT_MARGIN = 8

export const TableWithNestedRowsCell = ({
    className,
    isLeadColumn,
    isTableScrolled,
    children,
    level,
    hasChildren,
    onClick,
    innerStyle = {},
}: PropsWithChildren<{
    className?: string
    isLeadColumn: boolean
    isTableScrolled?: boolean
    level: number
    hasChildren: boolean
    onClick?: (event: MouseEvent<HTMLTableCellElement>) => void
    innerStyle?: React.CSSProperties
}>) => {
    const isMobile = useScreenSize() === SCREEN_SIZE.SMALL

    return (
        <BodyCell
            innerClassName={classNames(css.small, {
                [css.columnCell]: !isLeadColumn,
            })}
            colSpan={isLeadColumn ? 2 : 1}
            className={classNames(
                {
                    [css.withShadow]: isLeadColumn && isTableScrolled,
                    [css.sticky]: isLeadColumn,
                    [css.leadColumn]: isLeadColumn,
                },
                className,
            )}
            style={isLeadColumn ? { left: `${EXPAND_COLUMN_WIDTH}px` } : {}}
            innerStyle={{
                ...(!hasChildren && { paddingLeft: 0 }),
                marginLeft: `${
                    level *
                        (isMobile
                            ? MOBILE_EXPAND_COLUMN_WIDTH
                            : EXPAND_COLUMN_WIDTH) +
                    (!hasChildren ? DEFAULT_MARGIN : DEFAULT_MARGIN * 2)
                }px`,
                ...innerStyle,
            }}
            onClick={onClick}
        >
            {children}
        </BodyCell>
    )
}
