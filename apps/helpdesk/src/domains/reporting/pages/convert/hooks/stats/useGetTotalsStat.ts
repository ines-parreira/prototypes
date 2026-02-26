import { useMemo } from 'react'

import {
    usePostReporting,
    usePostReportingV2,
} from 'domains/reporting/models/queries'
import { convertCampaignEventsTotalsQueryFactoryV2 } from 'domains/reporting/models/scopes/convertCampaignOrderEvents'
import type { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import {
    getCampaignEventsTotalsData,
    getCampaignOrderTotalsData,
    getDefaultApiStatsFilters,
    getStoreRevenueTotalData,
} from 'domains/reporting/pages/convert/clients/CampaignCubeQueries'
import type {
    CubeFilterParams,
    CubeMetric,
} from 'domains/reporting/pages/convert/clients/types'
import {
    getMetricFromCubeData,
    transformToCampaignCalculatedTotals,
    transformToCampaignEventsTotals,
    transformToCampaignOrdersTotals,
    transformToStoreTotal,
} from 'domains/reporting/pages/convert/services/CampaignMetricsHelper'
import { CampaignsTotalsMetricNames } from 'domains/reporting/pages/convert/services/constants'
import type { CampaignsTotals } from 'domains/reporting/pages/convert/services/types'
import { getDefaultsForMetricKeys } from 'domains/reporting/pages/convert/services/utils'

const OVERRIDES = {
    select: getMetricFromCubeData,
}

export type GetTotalsQuery = {
    isFetching: boolean
    isError: boolean
    data?: CampaignsTotals
}

export const useGetTotalsStat = (
    namespacedShopName: string,
    campaignIds: string[] | null,
    campaignsOperator: LogicalOperatorEnum,
    currency: string,
    startDate: string,
    endDate: string,
    timezone: string,
): GetTotalsQuery => {
    const attrs: CubeFilterParams = useMemo(
        () => ({
            shopName: namespacedShopName,
            campaignIds: campaignIds || [],
            campaignsOperator,
            startDate,
            endDate,
            timezone,
        }),
        [
            namespacedShopName,
            campaignIds,
            startDate,
            endDate,
            timezone,
            campaignsOperator,
        ],
    )

    const campaignEventsTotalsQuery = useMemo(
        () => getCampaignEventsTotalsData(attrs),
        [attrs],
    )
    const campaignOrderTotalsQuery = useMemo(
        () => getCampaignOrderTotalsData(attrs),
        [attrs],
    )
    const storeTotalQuery = useMemo(
        () => getStoreRevenueTotalData(attrs),
        [attrs],
    )

    const eventsTotals = usePostReportingV2(
        campaignEventsTotalsQuery,
        convertCampaignEventsTotalsQueryFactoryV2({
            filters: getDefaultApiStatsFilters(attrs),
            timezone,
        }),
        { ...OVERRIDES, enabled: campaignIds !== null },
    )
    const orderTotals = usePostReporting<[CubeMetric], CubeMetric>(
        campaignOrderTotalsQuery,
        { ...OVERRIDES, enabled: campaignIds !== null },
    )
    const storeTotal = usePostReporting<[CubeMetric], CubeMetric>(
        storeTotalQuery,
        { ...OVERRIDES, enabled: campaignIds !== null },
    )

    const data = useMemo(() => {
        return {
            ...transformToCampaignEventsTotals(eventsTotals.data),
            ...transformToCampaignOrdersTotals(orderTotals.data, currency),
            ...transformToStoreTotal(storeTotal.data, currency),
            ...transformToCampaignCalculatedTotals(
                orderTotals.data,
                storeTotal.data,
            ),
        }
    }, [eventsTotals.data, orderTotals.data, storeTotal.data, currency])

    return {
        isFetching:
            eventsTotals.isFetching ||
            orderTotals.isFetching ||
            storeTotal.isFetching,
        isError:
            eventsTotals.isError || orderTotals.isError || storeTotal.isError,
        data:
            campaignIds === null
                ? getDefaultsForMetricKeys(CampaignsTotalsMetricNames)
                : data,
    }
}
