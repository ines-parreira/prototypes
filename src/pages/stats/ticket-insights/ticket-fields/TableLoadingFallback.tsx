import React from 'react'

import Skeleton from 'react-loading-skeleton'

import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import css from 'pages/stats/ticket-insights/ticket-fields/TicketDistributionTable.less'

export const TableLoadingFallback = ({
    rowsPerPage = 10,
}: {
    rowsPerPage?: number
}) => {
    return (
        <TableWrapper className={css.table}>
            <TableBody>
                {new Array(rowsPerPage).fill(null).map((_, rowIndex) => (
                    <TableBodyRow key={rowIndex}>
                        <BodyCell>
                            <Skeleton inline width={260} />
                        </BodyCell>
                        <BodyCell justifyContent="right">
                            <Skeleton inline width={65} />
                        </BodyCell>
                        <BodyCell justifyContent="right">
                            <Skeleton inline width={40} />
                        </BodyCell>
                    </TableBodyRow>
                ))}
                <TableBodyRow className={css.lastRow}>
                    <BodyCell>
                        <Skeleton width={260} />
                    </BodyCell>
                    <BodyCell justifyContent="right">
                        <Skeleton width={65} />
                    </BodyCell>
                    <BodyCell justifyContent="right">
                        <Skeleton width={40} />
                    </BodyCell>
                </TableBodyRow>
            </TableBody>
        </TableWrapper>
    )
}
