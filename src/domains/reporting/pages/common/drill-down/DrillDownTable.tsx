import React, { FunctionComponent } from 'react'

import { DrillDownDataHook } from 'domains/reporting/hooks/useDrillDownData'
import {
    ConvertDrillDownRowData,
    TicketDrillDownRowData,
    VoiceCallDrillDownRowData,
} from 'domains/reporting/pages/common/drill-down/DrillDownFormatters'
import css from 'domains/reporting/pages/common/drill-down/DrillDownTable.less'
import { ColumnConfig } from 'domains/reporting/pages/common/drill-down/types'
import { DrillDownMetric } from 'domains/reporting/state/ui/stats/drillDownSlice'
import { NumberedPagination } from 'pages/common/components/Paginations'
import TableWrapper from 'pages/common/components/table/TableWrapper'

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
