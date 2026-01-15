import { useMemo } from 'react'

import { formatMetricValue } from '@repo/reporting'

import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { ProductTableKeys } from 'domains/reporting/pages/automate/aiSalesAgent/constants'
import { createCsv } from 'utils/file'

import { useShoppingAssistantTopProductsMetrics } from './useShoppingAssistantTopProductsMetrics'

const FILE_NAME = 'shopping-assistant-top-products'

export const useDownloadShoppingAssistantTopProductsData = () => {
    const { cleanStatsFilters } = useStatsFilters()
    const { data, isFetching } = useShoppingAssistantTopProductsMetrics()

    const csvData = useMemo(() => {
        if (!data || data.length === 0) {
            return null
        }

        const rows: string[][] = [
            [
                'product_name',
                'times_recommended',
                'click_through_rate',
                'buy_through_rate',
            ],
        ]

        data.forEach((item) => {
            const recommendations = Number(
                item.metrics[ProductTableKeys.NumberOfRecommendations] ?? 0,
            )
            const ctr = Number(item.metrics[ProductTableKeys.CTR] ?? 0)
            const btr = Number(item.metrics[ProductTableKeys.BTR] ?? 0)

            rows.push([
                item.product.title,
                formatMetricValue(recommendations, 'integer'),
                formatMetricValue(ctr, 'percent-precision-1'),
                formatMetricValue(btr, 'percent-precision-1'),
            ])
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
