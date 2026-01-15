import { useMemo } from 'react'

import { formatMetricValue } from '@repo/reporting'

import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { createCsv } from 'utils/file'

import { useTotalSalesByProduct } from './useTotalSalesByProduct'

const FILE_NAME = 'total-sales-by-product'

export const useDownloadTotalSalesByProductData = () => {
    const { cleanStatsFilters } = useStatsFilters()
    const { data, isFetching } = useTotalSalesByProduct()

    const csvData = useMemo(() => {
        const { chartData, currency } = data

        if (!chartData || chartData.length === 0) {
            return null
        }

        const filteredData = chartData.filter((item) => item.value !== 0)

        const rows: string[][] = [['product', 'total_sales']]

        filteredData.forEach((item) => {
            const formattedValue = formatMetricValue(
                item.value,
                'currency',
                currency,
            )
            rows.push([item.name, formattedValue])
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
        isLoading: isFetching,
    }
}
