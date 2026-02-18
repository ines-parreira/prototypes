import { useMemo } from 'react'

import { formatMetricValue } from '@repo/reporting'

import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { createCsv } from 'utils/file'

import { useSupportInteractionsByIntent } from './useSupportInteractionsByIntent'

const FILE_NAME = 'support-interactions-by-intent'

export const useDownloadSupportInteractionsByIntentData = () => {
    const { cleanStatsFilters } = useStatsFilters()
    const { data, isLoading } = useSupportInteractionsByIntent()

    const csvData = useMemo(() => {
        if (!data) {
            return null
        }

        const rows: string[][] = [['intent', 'support_interactions']]

        const filteredData = data.filter((item) => item.value !== 0)

        filteredData.forEach((item) => {
            const intentName = item.name.replace('::', '/')
            const formattedValue = formatMetricValue(item.value, 'integer')
            rows.push([intentName, formattedValue])
        })

        return createCsv(rows)
    }, [data])

    const fileName = getCsvFileNameWithDates(
        cleanStatsFilters.period,
        FILE_NAME,
    )

    const files = useMemo(() => {
        if (!csvData) {
            return {}
        }
        return { [fileName]: csvData }
    }, [csvData, fileName])

    return {
        files,
        isLoading,
    }
}
