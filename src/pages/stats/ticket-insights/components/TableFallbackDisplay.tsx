import React from 'react'

import Skeleton from 'react-loading-skeleton'

import BodyCell from 'pages/common/components/table/cells/BodyCell'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import { NoDataAvailable } from 'pages/stats/common/components/NoDataAvailable'
import { NestedTableColumnConfig } from 'pages/stats/common/components/Table/TableWithNestedRows'
import { HintTooltipContent } from 'pages/stats/common/HintTooltip'
import css from 'pages/stats/ticket-insights/ticket-fields/TicketDistributionTable.less'

export const TableFallbackDisplay = ({
    isLoading,
    noData,
    columnOrder,
    columnConfig,
    rowsPerPage = 10,
    children,
}: {
    isLoading: boolean
    noData: boolean
    rowsPerPage?: number
    columnOrder: string[]
    columnConfig: Record<string, NestedTableColumnConfig>
    children: React.ReactNode
}) => {
    if (isLoading) {
        return (
            <TableWrapper className={css.table}>
                <TableBody>
                    {columnOrder.map((column) => (
                        <HeaderCellProperty
                            key={column}
                            title={columnConfig[column].title}
                            tooltip={
                                <HintTooltipContent
                                    {...columnConfig[column].tooltip}
                                />
                            }
                        ></HeaderCellProperty>
                    ))}
                    {new Array(rowsPerPage).fill(null).map((_, rowIndex) => (
                        <TableBodyRow key={rowIndex}>
                            {columnOrder.map((column, columnIndex) => (
                                <BodyCell key={column}>
                                    <Skeleton
                                        inline
                                        width={columnIndex === 0 ? 260 : 65}
                                    />
                                </BodyCell>
                            ))}
                        </TableBodyRow>
                    ))}
                    <TableBodyRow className={css.lastRow}>
                        {columnOrder.map((column, columnIndex) => (
                            <BodyCell key={column}>
                                <Skeleton
                                    inline
                                    width={columnIndex === 0 ? 260 : 65}
                                />
                            </BodyCell>
                        ))}
                    </TableBodyRow>
                </TableBody>
            </TableWrapper>
        )
    }

    if (noData) {
        return (
            <>
                <TableWrapper className={css.table}>
                    <TableBody>
                        {columnOrder.map((column) => (
                            <HeaderCellProperty
                                key={column}
                                title={columnConfig[column].title}
                                tooltip={
                                    <HintTooltipContent
                                        {...columnConfig[column].tooltip}
                                    />
                                }
                            ></HeaderCellProperty>
                        ))}
                    </TableBody>
                </TableWrapper>
                <NoDataAvailable style={{ minHeight: 300 }} />
            </>
        )
    }

    return <>{children}</>
}
