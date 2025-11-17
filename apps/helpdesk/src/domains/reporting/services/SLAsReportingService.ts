import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import type { Period } from 'domains/reporting/models/stat/types'
import { createCsv } from 'utils/file'

export const createTimeSeriesPerDimensionReport = (
    data: {
        label: string
        data: (string | number)[][]
    }[],
    period: Period,
) => {
    if (data.length === 0) {
        return { files: {} }
    }

    const files = data.reduce<Record<string, string>>(
        (acc, { data, label }) => ({
            ...acc,
            [getCsvFileNameWithDates(period, label)]: createCsv(data),
        }),
        {},
    )

    return {
        files: files,
    }
}
