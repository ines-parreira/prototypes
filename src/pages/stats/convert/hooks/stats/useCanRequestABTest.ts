import moment from 'moment'
import {useMemo} from 'react'

import {usePostReporting} from 'models/reporting/queries'
import {getCampaignABTestEvents} from 'pages/stats/convert/clients/CampaignCubeQueries'
import {CubeFilterParams, CubeMetric} from 'pages/stats/convert/clients/types'
import {
    getMetricFromCubeData,
    transformToCampaignAbTestEvent,
} from 'pages/stats/convert/services/CampaignMetricsHelper'
import {getPreviousMonthRange} from 'pages/stats/convert/utils/getPreviousMonthRange'

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
        [attrs]
    )
    const campaignABTestEventsData = usePostReporting<[CubeMetric], CubeMetric>(
        campaignABTestEventsQuery,
        OVERRIDES
    )

    const canRequestABTest = useMemo<boolean>(() => {
        const transformedData = {
            ...transformToCampaignAbTestEvent(campaignABTestEventsData.data),
        }

        const daysDiff = moment(new Date()).diff(
            moment(transformedData.firstImpression),
            'days'
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
