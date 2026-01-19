import { useMemo } from 'react'

import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { ProductTableKeys } from 'domains/reporting/pages/automate/aiSalesAgent/constants'
import { formatPercentage } from 'pages/common/utils/numbers'
import { createCsv } from 'utils/file'

import { useShoppingAssistantTopProductsMetrics } from './useShoppingAssistantTopProductsMetrics'

const SHOPPING_ASSISTANT_TOP_PRODUCTS_FILENAME =
    'shopping-assistant-top-products'

export const useDownloadShoppingAssistantTopProductsData = () => {
    const { cleanStatsFilters } = useStatsFilters()
    const { data, isFetching } = useShoppingAssistantTopProductsMetrics()

    const csvData = useMemo(() => {
        if (!data || data.length === 0) {
            return []
        }

        return [
            [
                'Product name',
                'Times recommended',
                'Click-through rate',
                'Buy through rate',
            ],
            ...data.map((row) => {
                const recommendations =
                    row.metrics[ProductTableKeys.NumberOfRecommendations]
                const ctr = row.metrics[ProductTableKeys.CTR]
                const btr = row.metrics[ProductTableKeys.BTR]
                return [
                    row.product.title || `Product ${row.product.id}`,
                    typeof recommendations === 'number'
                        ? recommendations.toLocaleString()
                        : String(recommendations ?? 0),
                    formatPercentage(
                        typeof ctr === 'number' ? ctr : Number(ctr ?? 0),
                    ),
                    formatPercentage(
                        typeof btr === 'number' ? btr : Number(btr ?? 0),
                    ),
                ]
            }),
        ]
    }, [data])

    const fileName = getCsvFileNameWithDates(
        cleanStatsFilters.period,
        SHOPPING_ASSISTANT_TOP_PRODUCTS_FILENAME,
    )

    return {
        files: {
            [fileName]: createCsv(csvData),
        },
        fileName,
        isLoading: isFetching,
    }
}
