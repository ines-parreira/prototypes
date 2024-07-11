import React, {FunctionComponent} from 'react'

import {NumberedPagination} from 'pages/common/components/Paginations'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import {DrillDownMetric} from 'state/ui/stats/drillDownSlice'
import css from 'pages/stats/DrillDownTable.less'
import {DrillDownDataHook} from 'hooks/reporting/useDrillDownData'
import {
    ConvertDrillDownRowData,
    TicketDrillDownRowData,
    VoiceCallDrillDownRowData,
} from 'pages/stats/DrillDownFormatters'

export const DrillDownTable = ({
    metricData,
    useDataHook,
    TableContent,
}: {
    metricData: DrillDownMetric
    useDataHook: DrillDownDataHook<
        | TicketDrillDownRowData
        | ConvertDrillDownRowData
        | VoiceCallDrillDownRowData
    >

    TableContent: FunctionComponent<{
        metricData: DrillDownMetric
    }>
}) => {
    const {currentPage, pagesCount, onPageChange} = useDataHook(metricData)

    return (
        <>
            <div className={css.container}>
                <TableWrapper className={css.table}>
                    <TableContent metricData={metricData} />
                </TableWrapper>
            </div>
            {pagesCount > 1 && (
                <NumberedPagination
                    count={pagesCount}
                    page={currentPage}
                    onChange={onPageChange}
                    className={css.pagination}
                />
            )}
        </>
    )
}
