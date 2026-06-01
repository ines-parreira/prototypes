import { useMemo } from 'react'

import { ReportingMetricBreakdownTable } from '@repo/reporting'

import { ProductTableKeys } from 'domains/reporting/pages/automate/aiSalesAgent/constants'
import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import type { DashboardSchema } from 'domains/reporting/pages/dashboards/types'
import { useShoppingAssistantTopProductsMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useShoppingAssistantTopProductsMetrics'

import { SHOPPING_ASSISTANT_TOP_PRODUCTS_COLUMNS } from './columns'
import {
    DownloadShoppingAssistantTopProductsButton,
    useDownloadShoppingAssistantTopProductsAction,
} from './DownloadShoppingAssistantTopProductsButton'

type Props = {
    chartId?: string
    withChartMenu?: boolean
    dashboard?: DashboardSchema
    chartConfig?: { label: string }
    isCustomDashboard?: boolean
}

export const ShoppingAssistantTopProductsTable = ({
    chartId,
    withChartMenu,
    dashboard,
    chartConfig,
    isCustomDashboard,
}: Props) => {
    const {
        flatData,
        productNameMap,
        productUrlMap,
        productImageMap,
        isFetching,
    } = useShoppingAssistantTopProductsMetrics()

    const exportCsvAction = useDownloadShoppingAssistantTopProductsAction()

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

    const withMenu = withChartMenu && chartId

    return (
        <ReportingMetricBreakdownTable
            data={flatData}
            metricColumns={SHOPPING_ASSISTANT_TOP_PRODUCTS_COLUMNS}
            loadingStates={{
                [ProductTableKeys.NumberOfRecommendations]: isFetching,
                [ProductTableKeys.CTR]: isFetching,
                [ProductTableKeys.BTR]: isFetching,
            }}
            DownloadButton={
                !withMenu ? (
                    <DownloadShoppingAssistantTopProductsButton />
                ) : undefined
            }
            actionMenu={
                withMenu ? (
                    <ChartsActionMenu
                        chartId={chartId}
                        chartName="Top products recommended"
                        dashboard={dashboard}
                        exportCsvAction={exportCsvAction}
                    />
                ) : undefined
            }
            chartId={chartId}
            nameColumns={nameColumns}
            isCustomDashboard={isCustomDashboard}
            name={chartConfig?.label}
        />
    )
}
