import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'

export const getDateRange = (startDate: string, endDate: string): string[] => {
    return [
        formatReportingQueryDate(startDate),
        formatReportingQueryDate(endDate),
    ]
}
