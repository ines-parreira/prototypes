import React, {
    FC,
    UIEventHandler,
    useCallback,
    useMemo,
    useState,
} from 'react'

import classNames from 'classnames'

import useMeasure from 'hooks/useMeasure'
import { opposite, OrderDirection } from 'models/api/types'
import { NumberedPagination } from 'pages/common/components/Paginations'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import css from 'pages/stats/common/components/Table/TableWithNestedRows.less'
import { HintTooltipContent } from 'pages/stats/common/HintTooltip'
import { TooltipData } from 'pages/stats/types'

type NestedRowProps<Columns extends string> = {
    intentCustomFieldId?: number
    level?: number
    isTableScrolled?: boolean
    columnOrder?: Columns[]
}

type WithChildren<T> = T

type Props<
    RowProps extends {
        entityId: string
        value: number
        prevValue: number
    },
    Columns extends string,
> = {
    RowComponent: FC<RowProps> & NestedRowProps<Columns>
    rows: WithChildren<RowProps>[]
    perPage: number
    columnOrder: Columns[]
    leadColumn: Columns
    sortingOrder: {
        column: Columns
        direction: OrderDirection
    }
    getSetOrderHandler: (order: {
        column: Columns
        direction: OrderDirection
    }) => void
    columnConfig: Record<
        Columns,
        {
            title: string
            tooltip: TooltipData
            isSortable: boolean
        }
    >
    isScrollable?: boolean
    intentCustomFieldId?: number
}

export const TableWithNestedRows = <
    RowProps extends {
        entityId: string
        value: number
        prevValue: number
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
    isScrollable = true,
    intentCustomFieldId,
}: Props<RowProps, Columns>) => {
    const [currentPage, setCurrentPage] = useState(1)
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

    const paginatedRows = useMemo(() => {
        const startingItem = (currentPage - 1) * perPage
        const lastItem = Math.min(startingItem + perPage, rows.length)
        return rows.slice(startingItem, lastItem)
    }, [currentPage, perPage, rows])

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
                                    [css.headerCell]: column !== leadColumn,
                                })}
                                colSpan={column === leadColumn ? 2 : 1}
                                title={columnConfig[column].title}
                                tooltip={
                                    <HintTooltipContent
                                        {...columnConfig[column].tooltip}
                                    />
                                }
                                isOrderedBy={sortingOrder.column === column}
                                direction={opposite(sortingOrder.direction)}
                                onClick={
                                    columnConfig[column].isSortable
                                        ? () =>
                                              getSetOrderHandler({
                                                  column,
                                                  direction: opposite(
                                                      sortingOrder.direction,
                                                  ),
                                              })
                                        : undefined
                                }
                            />
                        ))}
                    </TableHead>
                    <TableBody>
                        {paginatedRows.map((row, index) => (
                            <RowComponent
                                key={row.entityId}
                                columnOrder={columnOrder}
                                isTableScrolled={isTableScrolled}
                                intentsCustomFieldId={intentCustomFieldId}
                                defaultExpanded={index === 0}
                                {...row}
                            />
                        ))}
                    </TableBody>
                </TableWrapper>
            </div>

            {hasPagination && (
                <NumberedPagination
                    count={Math.ceil(rows.length / perPage)}
                    page={currentPage}
                    onChange={setCurrentPage}
                    className={css.pagination}
                />
            )}
        </>
    )
}
