import type { FunctionComponent } from 'react'
import React, { useCallback, useMemo, useState } from 'react'

import { Pagination } from '@gorgias/axiom'

import {
    defaultEnrichmentFields,
    extraEnrichmentFieldsPerMetric,
    useEnrichedDrillDownDataUnpaginated,
} from 'domains/reporting/hooks/useDrillDownData'
import { EnrichmentFields } from 'domains/reporting/models/types'
import { DrillDownDataProvider } from 'domains/reporting/pages/common/drill-down/DrillDownDataContext'
import {
    formatKnowledgeTicketDrillDownRowData,
    formatTicketDrillDownRowData,
} from 'domains/reporting/pages/common/drill-down/DrillDownFormatters'
import css from 'domains/reporting/pages/common/drill-down/DrillDownTable.less'
import { getDrillDownQuery } from 'domains/reporting/pages/common/drill-down/helpers'
import type { ColumnConfig } from 'domains/reporting/pages/common/drill-down/types'
import type { DrillDownMetric } from 'domains/reporting/state/ui/stats/drillDownSlice'
import { KnowledgeMetric } from 'domains/reporting/state/ui/stats/types'

export const DrillDownTable: FunctionComponent<{
    metricData: DrillDownMetric
    TableContent: FunctionComponent<{
        metricData: DrillDownMetric
        columnConfig: ColumnConfig
    }>
    columnConfig: ColumnConfig
}> = ({ metricData, TableContent, columnConfig }) => {
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [currentPage, setCurrentPage] = useState(1)

    const isKnowledgeMetric = Object.values(KnowledgeMetric)
        .map(String)
        .includes(String(metricData.metricName))

    const formatter = isKnowledgeMetric
        ? formatKnowledgeTicketDrillDownRowData
        : formatTicketDrillDownRowData

    const dataHookResult = useEnrichedDrillDownDataUnpaginated(
        getDrillDownQuery(metricData),
        metricData,
        extraEnrichmentFieldsPerMetric[metricData.metricName] ||
            defaultEnrichmentFields,
        formatter,
        EnrichmentFields.TicketId,
    )
    const { data: allData = [], isFetching } = dataHookResult

    const pagesCount = useMemo(() => {
        return Math.ceil(allData.length / itemsPerPage)
    }, [allData.length, itemsPerPage])

    const hasNextPage = currentPage < pagesCount
    const hasPreviousPage = currentPage > 1

    const handlePageChange = useCallback(
        (direction: 'next' | 'previous') => {
            setCurrentPage((prev) => {
                if (direction === 'next' && prev < pagesCount) {
                    return prev + 1
                } else if (direction === 'previous' && prev > 1) {
                    return prev - 1
                }
                return prev
            })
        },
        [pagesCount],
    )

    const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
        setItemsPerPage(newItemsPerPage)
        setCurrentPage(1) // Reset to first page when changing page size
    }, [])

    // Create paginated data to provide via context
    const paginatedData = useMemo(
        () => ({
            ...dataHookResult,
            data: allData.slice(
                (currentPage - 1) * itemsPerPage,
                currentPage * itemsPerPage,
            ),
            isFetching,
            perPage: itemsPerPage,
            pagesCount,
            currentPage,
            onPageChange: (page: number) => setCurrentPage(page),
        }),
        [
            dataHookResult,
            allData,
            currentPage,
            itemsPerPage,
            isFetching,
            pagesCount,
        ],
    )

    return (
        <div className={css.container}>
            <div className={css.tableBorder}>
                <div className={css.tableWrapper}>
                    <table className={css.table}>
                        <DrillDownDataProvider value={paginatedData}>
                            <TableContent
                                metricData={metricData}
                                columnConfig={columnConfig}
                            />
                        </DrillDownDataProvider>
                    </table>
                </div>
            </div>
            {pagesCount > 1 && (
                <div className={css.pagination}>
                    <Pagination
                        hasNextPage={hasNextPage}
                        hasPreviousPage={hasPreviousPage}
                        onPageChange={handlePageChange}
                        options={[10]}
                        onItemsPerPageChange={handleItemsPerPageChange}
                        hasLinesPerPage={false}
                    />
                </div>
            )}
        </div>
    )
}
