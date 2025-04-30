import React, { MouseEvent, PropsWithChildren } from 'react'

import classNames from 'classnames'

import { SCREEN_SIZE, useScreenSize } from 'hooks/useScreenSize'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import css from 'pages/stats/common/components/Table/BreakdownTable.less'

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
}: PropsWithChildren<{
    className?: string
    isLeadColumn: boolean
    isTableScrolled?: boolean
    level: number
    hasChildren: boolean
    onClick?: (event: MouseEvent<HTMLTableCellElement>) => void
}>) => {
    const isMobile = useScreenSize() === SCREEN_SIZE.SMALL

    return (
        <BodyCell
            innerClassName={css.small}
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
            }}
            onClick={onClick}
        >
            {children}
        </BodyCell>
    )
}
