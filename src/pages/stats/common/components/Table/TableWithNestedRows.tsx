import React, { FC, UIEventHandler, useCallback, useState } from 'react'

import classNames from 'classnames'

import useMeasure from 'hooks/useMeasure'
import { opposite, OrderDirection } from 'models/api/types'
import { StatsFilters } from 'models/stat/types'
import { NumberedPagination } from 'pages/common/components/Paginations'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import {
    TableBodyRowExpandable,
    WithChildren,
} from 'pages/common/components/table/TableBodyRowExpandable'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import css from 'pages/stats/common/components/Table/BreakdownTable.less'
import { TooltipData } from 'pages/stats/types'

type NestedRowProps<Columns extends string> = {
    level?: number
    isTableScrolled?: boolean
    columnOrder?: Columns[]
}

type Props<
    RowProps extends {
        entityId: string
    },
    Columns extends string,
> = {
    RowComponent: FC<RowProps & NestedRowProps<Columns>>
    rows: WithChildren<RowProps>[]
    perPage: number
    columnOrder: Columns[]
    leadColumn: Columns
    currentPage: number
    setCurrentPage: (page: number) => void
    sortingOrder: {
        column: Columns
        direction: OrderDirection
    }
    getSetOrderHandler: (column: Columns) => () => void
    columnConfig: Record<
        Columns,
        {
            title: string
            tooltip: TooltipData
            useData: (
                statsFilters: StatsFilters,
                userTimeZone: string,
                customFieldValueString: string,
                productId?: string,
            ) => {
                value: string
            }
        }
    >
    isScrollable?: boolean
}

export const TableWithNestedRows = <
    RowProps extends {
        entityId: string
    },
    Columns extends string,
>({
    RowComponent,
    rows,
    perPage,
    columnOrder,
    leadColumn,
    sortingOrder,
    columnConfig,
    getSetOrderHandler,
    currentPage,
    setCurrentPage,
    isScrollable = true,
}: Props<RowProps, Columns>) => {
    const [ref, { width }] = useMeasure<HTMLDivElement>()
    const [isTableScrolled, setIsTableScrolled] = useState(false)
    const handleScroll: UIEventHandler<HTMLDivElement> = useCallback(
        (event) => {
            if (isScrollable && event.currentTarget.scrollLeft > 0) {
                setIsTableScrolled(true)
            } else {
                setIsTableScrolled(false)
            }
        },
        [isScrollable],
    )

    const hasPagination = rows.length > perPage

    return (
        <>
            <div
                ref={ref}
                className={classNames(css.container, {
                    [css.withPagination]: hasPagination,
                })}
                onScroll={handleScroll}
            >
                <TableWrapper className={css.table} style={{ width }}>
                    <TableHead>
                        {columnOrder.map((column) => (
                            <HeaderCellProperty
                                key={column}
                                className={classNames({
                                    [css.withShadow]:
                                        column === leadColumn &&
                                        isTableScrolled,
                                })}
                                colSpan={column === leadColumn ? 2 : 1}
                                title={columnConfig[column].title}
                                tooltip={columnConfig[column].tooltip.title}
                                isOrderedBy={sortingOrder.column === column}
                                direction={opposite(sortingOrder.direction)}
                                onClick={getSetOrderHandler(column)}
                            />
                        ))}
                    </TableHead>
                    <TableBody>
                        {rows.map((row) => (
                            <TableBodyRowExpandable<RowProps>
                                key={row.entityId}
                                RowContentComponent={RowComponent}
                                rowContentProps={{
                                    ...row,
                                    columnOrder,
                                    isTableScrolled,
                                    children: row.children.map((child) => ({
                                        ...child,
                                        isTableScrolled,
                                        columnOrder,
                                        entityId: row.entityId,
                                    })),
                                }}
                            />
                        ))}
                    </TableBody>
                </TableWrapper>
            </div>
            <div>
                {hasPagination && (
                    <NumberedPagination
                        count={Math.ceil(rows.length / perPage)}
                        page={currentPage}
                        onChange={setCurrentPage}
                        className={css.pagination}
                    />
                )}
            </div>
        </>
    )
}
