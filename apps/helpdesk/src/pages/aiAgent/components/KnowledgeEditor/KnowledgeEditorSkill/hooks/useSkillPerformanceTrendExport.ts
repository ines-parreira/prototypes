import { useCallback } from 'react'

import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { createCsv, saveFileAsDownloaded } from 'utils/file'

import {
    SKILL_PERFORMANCE_TREND_CSAT_DATA_KEY,
    SKILL_PERFORMANCE_TREND_TICKET_VOLUME_DATA_KEY,
} from './skillPerformanceTrendDataKeys'
import { useSkillPerformanceTrendFromContext } from './useSkillPerformanceTrendFromContext'

const CSV_HEADER = ['Date', 'Tickets', 'CSAT'] as const
const CSV_REPORT_SLUG = 'skill-performance-trend'
const CSV_CONTENT_TYPE = 'text/csv'

const formatCell = (value: unknown): string =>
    value === null || value === undefined ? '' : String(value)

/**
 * Adapter hook for `DashboardExportButton`'s CSV path. Shapes the trend
 * modal's chart data into a CSV and writes it via existing reporting
 * helpers. `isLoading` mirrors the trend hook so the LazyCsvExporter waits
 * for data before triggering the download.
 */
export const useSkillPerformanceTrendExport = (): {
    triggerDownload: () => Promise<void>
    isLoading: boolean
} => {
    const { chartData, dateRange, isLoading } =
        useSkillPerformanceTrendFromContext()

    const triggerDownload = useCallback(async () => {
        if (chartData.length === 0) return

        const rows: unknown[][] = [
            [...CSV_HEADER],
            ...chartData.map((point) => [
                point.date,
                formatCell(
                    point[SKILL_PERFORMANCE_TREND_TICKET_VOLUME_DATA_KEY],
                ),
                formatCell(point[SKILL_PERFORMANCE_TREND_CSAT_DATA_KEY]),
            ]),
        ]

        const fileName = getCsvFileNameWithDates(dateRange, CSV_REPORT_SLUG)
        saveFileAsDownloaded(fileName, createCsv(rows), CSV_CONTENT_TYPE)
    }, [chartData, dateRange])

    return { triggerDownload, isLoading }
}
