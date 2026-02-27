import { useMemo } from 'react'

import { usePostReportingV2 } from 'domains/reporting/models/queries'
import { convertCampaignEventsTotalsQueryFactoryV2 } from 'domains/reporting/models/scopes/convertCampaignOrderEvents'
import {
    convertCampaignOrderTotalsQueryFactoryV2,
    convertStoreRevenueTotalQueryFactoryV2,
} from 'domains/reporting/models/scopes/convertOrderConversion'
import type { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import {
    getCampaignEventsTotalsData,
    getCampaignOrderTotalsData,
    getDefaultApiStatsFilters,
    getStoreRevenueTotalData,
} from 'domains/reporting/pages/convert/clients/CampaignCubeQueries'
import type { CubeFilterParams } from 'domains/reporting/pages/convert/clients/types'
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

    const filters = getDefaultApiStatsFilters(attrs)
    const eventsTotals = usePostReportingV2(
        campaignEventsTotalsQuery,
        convertCampaignEventsTotalsQueryFactoryV2({
            filters,
            timezone,
        }),
        { ...OVERRIDES, enabled: campaignIds !== null },
    )
    const orderTotals = usePostReportingV2(
        campaignOrderTotalsQuery,
        convertCampaignOrderTotalsQueryFactoryV2({
            filters,
            timezone,
        }),
        { ...OVERRIDES, enabled: campaignIds !== null },
    )
    const storeTotal = usePostReportingV2(
        storeTotalQuery,
        convertStoreRevenueTotalQueryFactoryV2({
            filters: getDefaultApiStatsFilters({
                shopName: attrs.shopName,
                startDate,
                endDate,
                allowNoCampaign: true,
            }),
            timezone,
        }),
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
