import { useMemo } from 'react'

import moment from 'moment'

import { usePostReportingV2 } from 'domains/reporting/models/queries'
import { convertCampaignABTestEventsQueryFactoryV2 } from 'domains/reporting/models/scopes/convertCampaignOrderEvents'
import {
    getCampaignABTestEvents,
    getDefaultApiStatsFilters,
} from 'domains/reporting/pages/convert/clients/CampaignCubeQueries'
import type { CubeFilterParams } from 'domains/reporting/pages/convert/clients/types'
import {
    getMetricFromCubeData,
    transformToCampaignAbTestEvent,
} from 'domains/reporting/pages/convert/services/CampaignMetricsHelper'
import { getPreviousMonthRange } from 'domains/reporting/pages/convert/utils/getPreviousMonthRange'

const MIN_NUMBER_OF_ORDERS = 2000
const MIN_SUBSCRIPTION_DAYS = 30
const OVERRIDES = {
    // Don't refresh query after
    staleTime: 0,
    cacheTime: 0,
    select: getMetricFromCubeData,
    refetchOnWindowFocus: false,
}

export const useCanRequestABTest = (shopName: string) => {
    const attrs: CubeFilterParams = useMemo(() => {
        const [startDate, endDate] = getPreviousMonthRange()

        return {
            shopName,
            startDate,
            endDate,
        }
    }, [shopName])

    const campaignABTestEventsQuery = useMemo(
        () => getCampaignABTestEvents(attrs),
        [attrs],
    )
    const campaignABTestEventsData = usePostReportingV2(
        campaignABTestEventsQuery,
        convertCampaignABTestEventsQueryFactoryV2({
            filters: getDefaultApiStatsFilters(attrs),
            timezone: attrs.timezone || 'UTC',
        }),
        OVERRIDES,
    )

    const canRequestABTest = useMemo<boolean>(() => {
        const transformedData = {
            ...transformToCampaignAbTestEvent(campaignABTestEventsData.data),
        }

        const daysDiff = moment(new Date()).diff(
            moment(transformedData.firstImpression),
            'days',
        )

        return (
            transformedData.orderCount >= MIN_NUMBER_OF_ORDERS &&
            daysDiff >= MIN_SUBSCRIPTION_DAYS
        )
    }, [campaignABTestEventsData.data])

    return {
        isFetching: campaignABTestEventsData.isFetching,
        isError: campaignABTestEventsData.isError,
        canRequestABTest: canRequestABTest,
    }
}
