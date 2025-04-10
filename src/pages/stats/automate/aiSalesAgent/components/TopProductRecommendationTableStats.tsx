import React, { useCallback, useState } from 'react'

import { Skeleton } from '@gorgias/merchant-ui-kit'

import useMeasure from 'hooks/useMeasure'
import { opposite, OrderDirection } from 'models/api/types'
import Navigation from 'pages/common/components/Navigation/Navigation'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import { formatPercentage } from 'pages/common/utils/numbers'
import {
    ProductTableConfig,
    ProductTableKeys,
} from 'pages/stats/automate/aiSalesAgent/constants'
import { useSortedAndPaginatedTableRows } from 'pages/stats/automate/aiSalesAgent/hooks/useSortedAndPaginatedTableRows'
import {
    ProductTableColumn,
    ProductTableContentCell,
} from 'pages/stats/automate/aiSalesAgent/types/productTable'
import { NoDataAvailable } from 'pages/stats/common/components/NoDataAvailable'
import { formatNumber } from 'pages/stats/common/utils'

import css from './TopProductRecommendationTableStats.less'

type Props = {
    rows: ProductTableContentCell[]
    perPage: number
    offset: number
    isLoading?: boolean
    onClickNextPage: () => void
    onClickPrevPage: () => void
}

export const TopProductRecommendationTableStats = ({
    rows,
    perPage,
    offset,
    isLoading,
    onClickNextPage,
    onClickPrevPage,
}: Props) => {
    const [ref, { width }] = useMeasure<HTMLDivElement>()
    const [orderKey, setOrderKey] = useState<ProductTableKeys>(
        ProductTableKeys.NumberOfRecommendations,
    )
    const [orderDirection, setOrderDirection] = useState<OrderDirection>(
        OrderDirection.Desc,
    )

    const columnsOrder = Object.keys(ProductTableConfig) as ProductTableKeys[]

    const getDataFromTableCell = (
        cell: ProductTableContentCell,
        key: ProductTableKeys,
    ): any => {
        if (key === ProductTableKeys.Name) {
            return cell.product.url ? (
                <a
                    href={cell.product?.url}
                    target="_blank"
                    rel="noreferrer noopener"
                >
                    {cell.product?.title}
                </a>
            ) : (
                cell.product?.title
            )
        }

        return cell.metrics[key] ?? 0
    }

    const paginatedRows = useSortedAndPaginatedTableRows(rows, {
        orderKey,
        orderDirection,
        offset,
        page: perPage,
        transform: getDataFromTableCell,
    })

    const handleClickHeaderCell = useCallback(
        (key: ProductTableKeys) => {
            if (orderKey === key) {
                setOrderDirection((direction) =>
                    direction === OrderDirection.Asc
                        ? OrderDirection.Desc
                        : OrderDirection.Asc,
                )
            } else {
                setOrderKey(key)
                setOrderDirection(OrderDirection.Asc)
            }
        },
        [orderKey],
    )

    const renderHeaderCells = useCallback(
        (headerCell: ProductTableColumn) => {
            return (
                <HeaderCellProperty
                    key={headerCell.key}
                    title={headerCell.title}
                    direction={opposite(orderDirection)}
                    isOrderedBy={orderKey === headerCell.key}
                    onClick={() => handleClickHeaderCell(headerCell.key)}
                />
            )
        },
        [handleClickHeaderCell, orderDirection, orderKey],
    )

    const renderCells = useCallback(
        (column: ProductTableColumn, cell: ProductTableContentCell) => {
            if (isLoading) {
                return (
                    <BodyCell>
                        <div style={{ width: '100%' }}>
                            <Skeleton count={1} width="100%" />
                        </div>
                    </BodyCell>
                )
            }

            const data = getDataFromTableCell(cell, column.key)

            if (column.metricFormat === 'decimal-to-percent') {
                return <BodyCell>{formatPercentage(data)}</BodyCell>
            }

            if (column.metricFormat === 'integer') {
                return <BodyCell>{formatNumber(data)}</BodyCell>
            }

            return <BodyCell>{data}</BodyCell>
        },
        [isLoading],
    )

    const renderRows = useCallback(
        (cell: ProductTableContentCell, index) => {
            return (
                <TableBodyRow key={index}>
                    {columnsOrder.map((column) =>
                        renderCells(ProductTableConfig[column], cell),
                    )}
                </TableBodyRow>
            )
        },
        [renderCells, columnsOrder],
    )

    const renderTableBody = useCallback(() => {
        return isLoading
            ? paginatedRows.slice(0, perPage).map(renderRows)
            : paginatedRows.map(renderRows)
    }, [isLoading, paginatedRows, renderRows, perPage])

    if (rows.length === 0 && !isLoading) {
        return <NoDataAvailable className={css.noData} />
    }

    return (
        <>
            <div ref={ref} className={css.container}>
                <TableWrapper className={css.table} style={{ width }}>
                    <TableHead className={css.header}>
                        {columnsOrder.map((column) =>
                            renderHeaderCells(ProductTableConfig[column]),
                        )}
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableBodyRow>
                                {columnsOrder.map((column) => (
                                    <BodyCell key={column}>
                                        <div style={{ width: '100%' }}>
                                            <Skeleton count={1} width="100%" />
                                        </div>
                                    </BodyCell>
                                ))}
                            </TableBodyRow>
                        ) : (
                            renderTableBody()
                        )}
                    </TableBody>
                </TableWrapper>
            </div>

            {rows.length > perPage && (
                <Navigation
                    className={css.pagination}
                    hasNextItems={offset + perPage < rows.length}
                    hasPrevItems={offset !== 0}
                    fetchNextItems={onClickNextPage}
                    fetchPrevItems={onClickPrevPage}
                />
            )}
        </>
    )
}
