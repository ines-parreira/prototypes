import { useMemo } from 'react'

import { ReportingMetricBreakdownTable } from '@repo/reporting'

import { ProductTableKeys } from 'domains/reporting/pages/automate/aiSalesAgent/constants'
import { useShoppingAssistantTopProductsMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useShoppingAssistantTopProductsMetrics'

import { SHOPPING_ASSISTANT_TOP_PRODUCTS_COLUMNS } from './columns'
import { DownloadShoppingAssistantTopProductsButton } from './DownloadShoppingAssistantTopProductsButton'

type Props = {
    chartId?: string
}

export const ShoppingAssistantTopProductsTable = ({ chartId }: Props) => {
    const {
        flatData,
        productNameMap,
        productUrlMap,
        productImageMap,
        isFetching,
    } = useShoppingAssistantTopProductsMetrics()

    const nameColumns = useMemo(
        () => [
            {
                accessor: 'entity',
                label: 'Product name',
                formatName: (id: string) => productNameMap[id] ?? id,
                getHref: (id: string) => productUrlMap[id],
                getAvatarProps: (id: string) => ({
                    name: productNameMap[id] ?? id,
                    url: productImageMap[id],
                }),
            },
        ],
        [productNameMap, productUrlMap, productImageMap],
    )

    return (
        <ReportingMetricBreakdownTable
            data={flatData}
            metricColumns={SHOPPING_ASSISTANT_TOP_PRODUCTS_COLUMNS}
            loadingStates={{
                [ProductTableKeys.NumberOfRecommendations]: isFetching,
                [ProductTableKeys.CTR]: isFetching,
                [ProductTableKeys.BTR]: isFetching,
            }}
            DownloadButton={<DownloadShoppingAssistantTopProductsButton />}
            chartId={chartId}
            nameColumns={nameColumns}
        />
    )
}
