import React, { FunctionComponent } from 'react'

import { DrillDownDataHook } from 'hooks/reporting/useDrillDownData'
import { NumberedPagination } from 'pages/common/components/Paginations'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import {
    ConvertDrillDownRowData,
    TicketDrillDownRowData,
    VoiceCallDrillDownRowData,
} from 'pages/stats/common/drill-down/DrillDownFormatters'
import css from 'pages/stats/common/drill-down/DrillDownTable.less'
import { ColumnConfig } from 'pages/stats/common/drill-down/types'
import { DrillDownMetric } from 'state/ui/stats/drillDownSlice'

export const DrillDownTable = ({
    metricData,
    useDataHook,
    TableContent,
    columnConfig,
}: {
    metricData: DrillDownMetric
    useDataHook: DrillDownDataHook<
        | TicketDrillDownRowData
        | ConvertDrillDownRowData
        | VoiceCallDrillDownRowData
    >

    TableContent: FunctionComponent<{
        metricData: DrillDownMetric
        columnConfig: ColumnConfig
    }>
    columnConfig: ColumnConfig
}) => {
    const { currentPage, pagesCount, onPageChange } = useDataHook(metricData)

    return (
        <>
            <div className={css.container}>
                <TableWrapper className={css.table}>
                    <TableContent
                        metricData={metricData}
                        columnConfig={columnConfig}
                    />
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
