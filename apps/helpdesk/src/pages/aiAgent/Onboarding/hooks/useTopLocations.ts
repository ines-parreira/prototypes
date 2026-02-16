import { useMemo } from 'react'

import moment from 'moment'

import { useMetric } from 'domains/reporting/hooks/useMetric'
import { useMetricPerDimension } from 'domains/reporting/hooks/useMetricPerDimension'
import {
    AiSalesAgentOrdersDimension,
    AiSalesAgentOrdersMeasure,
} from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import {
    topLocationsRecommendationsQueryFactory,
    totalNumberOfOrderQueryFactory,
} from 'domains/reporting/models/queryFactories/ai-sales-agent/metrics'
import { AISalesAgentTotalNumberOfOrderQueryFactoryV2 } from 'domains/reporting/models/scopes/AISalesAgentOrders'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import useAppSelector from 'hooks/useAppSelector'
import type { ShopifyIntegration } from 'models/integration/types'
import type { TopElement } from 'pages/aiAgent/Onboarding/components/TopElementsCard/types'
import { getTimezone } from 'state/currentUser/selectors'
import { getShopifyIntegrationByShopName } from 'state/integrations/selectors'

const fakeTopLocations = [
    {
        id: 'New York',
        title: 'New York',
        percentage: 30,
    },
    {
        id: 'Los Angeles',
        title: 'Los Angeles',
        percentage: 25,
    },
    {
        id: 'Chicago',
        title: 'Chicago',
        percentage: 20,
    },
    {
        id: 'Houston',
        title: 'Houston',
        percentage: 15,
    },
]

export const useTopLocations = ({
    shopName,
}: {
    shopName: string
}): { data: TopElement[]; isLoading: boolean } => {
    const shopifyIntegration: ShopifyIntegration = useAppSelector(
        getShopifyIntegrationByShopName(shopName || ''),
    ).toJS()

    const timezone = useAppSelector(getTimezone)

    const filters: StatsFilters = {
        period: {
            start_datetime: moment()
                .subtract(1, 'month')
                .startOf('day')
                .toISOString(),
            end_datetime: moment().endOf('day').toISOString(),
        },
        storeIntegrations: {
            operator: LogicalOperatorEnum.ONE_OF,
            values: [shopifyIntegration.id],
        },
    }

    const topLocationsMetric = useMetricPerDimension<string>(
        topLocationsRecommendationsQueryFactory(filters),
    )

    const totalOrdersMetric = useMetric(
        totalNumberOfOrderQueryFactory(filters, timezone ?? '', false),
        AISalesAgentTotalNumberOfOrderQueryFactoryV2(
            {
                filters,
                timezone: timezone ?? '',
            },
            false,
        ),
    )

    const totalCount = Number(totalOrdersMetric.data?.value ?? 0)

    const data = useMemo(() => {
        let topLocations = (topLocationsMetric.data?.allData || []).map(
            (record) => {
                const city = record[AiSalesAgentOrdersDimension.ShippingCity]
                const count = Number(
                    record[AiSalesAgentOrdersMeasure.Count] ?? 0,
                )
                const percentage = totalCount
                    ? Number(((count / totalCount) * 100).toFixed(1))
                    : 0

                return {
                    id: city,
                    title: city,
                    percentage,
                }
            },
        )

        if (topLocations.length > 0) {
            return topLocations
        }

        return fakeTopLocations
    }, [topLocationsMetric.data, totalCount])

    return {
        data,
        isLoading:
            topLocationsMetric.isFetching || totalOrdersMetric.isFetching,
    }
}
