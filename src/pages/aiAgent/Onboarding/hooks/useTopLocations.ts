import moment from 'moment'

import { useMetric } from 'hooks/reporting/useMetric'
import { useMetricPerDimension } from 'hooks/reporting/useMetricPerDimension'
import useAppSelector from 'hooks/useAppSelector'
import { ShopifyIntegration } from 'models/integration/types'
import {
    AiSalesAgentOrdersDimension,
    AiSalesAgentOrdersMeasure,
} from 'models/reporting/cubes/ai-sales-agent/AiSalesAgentOrders'
import {
    topLocationsRecommendationsQueryFactory,
    totalNumberOfOrderQueryFactory,
} from 'models/reporting/queryFactories/ai-sales-agent/metrics'
import { StatsFilters } from 'models/stat/types'
import { LogicalOperatorEnum } from 'pages/stats/common/components/Filter/constants'
import { getTimezone } from 'state/currentUser/selectors'
import { getShopifyIntegrationByShopName } from 'state/integrations/selectors'

export const useTopLocations = ({ shopName }: { shopName: string }) => {
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

    const topLocationsMetric = useMetricPerDimension(
        topLocationsRecommendationsQueryFactory(filters),
    )

    const totalOrdersMetric = useMetric(
        totalNumberOfOrderQueryFactory(filters, timezone ?? '', false),
    )

    const totalCount = Number(totalOrdersMetric.data?.value ?? 0)

    const data = (topLocationsMetric.data?.allData || []).map((record) => {
        const city = record[AiSalesAgentOrdersDimension.ShippingCity] ?? ''
        const count = Number(record[AiSalesAgentOrdersMeasure.Count] ?? 0)
        const percentage = totalCount
            ? Number(((count / totalCount) * 100).toFixed(1))
            : 0

        return {
            id: city,
            title: city,
            percentage,
        }
    })

    return {
        data,
        isLoading:
            topLocationsMetric.isFetching || totalOrdersMetric.isFetching,
    }
}
