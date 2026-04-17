import { ReportingMetricBreakdownTable } from '@repo/reporting'

import { ProductTableKeys } from 'domains/reporting/pages/automate/aiSalesAgent/constants'
import { useShoppingAssistantTopProductsMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useShoppingAssistantTopProductsMetrics'

import { SHOPPING_ASSISTANT_TOP_PRODUCTS_COLUMNS } from './columns'
import { DownloadShoppingAssistantTopProductsButton } from './DownloadShoppingAssistantTopProductsButton'

export const ShoppingAssistantTopProductsTable = () => {
    const {
        flatData,
        productNameMap,
        productUrlMap,
        productImageMap,
        isFetching,
    } = useShoppingAssistantTopProductsMetrics()

    return (
        <ReportingMetricBreakdownTable
            data={flatData}
            metricColumns={SHOPPING_ASSISTANT_TOP_PRODUCTS_COLUMNS}
            loadingStates={{
                [ProductTableKeys.NumberOfRecommendations]: isFetching,
                [ProductTableKeys.CTR]: isFetching,
                [ProductTableKeys.BTR]: isFetching,
            }}
            getRowKey={(row) => row.entity}
            DownloadButton={<DownloadShoppingAssistantTopProductsButton />}
            nameColumns={[
                {
                    accessor: 'entity',
                    label: 'Product name',
                    formatName: (id) => productNameMap[id] ?? id,
                    getHref: (id) => productUrlMap[id],
                    getAvatarProps: (id) => ({
                        name: productNameMap[id] ?? id,
                        url: productImageMap[id],
                    }),
                },
            ]}
        />
    )
}
