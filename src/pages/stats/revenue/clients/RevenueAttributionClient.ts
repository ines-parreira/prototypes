import {Stat, StatsFilters} from 'models/stat/types'
import {fetchStat} from 'models/stat/resources'
import {REVENUE_PER_DAY} from 'config/stats'
import {RevenueAttributionFilterParams} from 'pages/stats/revenue/clients/types'
import {getDateRange} from 'pages/stats/revenue/clients/utils'

export const getTicketsPerformanceData = async ({
    startDate,
    endDate,
    campaignIds,
    integrationIds,
    channels,
}: RevenueAttributionFilterParams): Promise<Stat> => {
    const [startDateUtc, endDateUtc] = getDateRange(startDate, endDate)
    const filters: StatsFilters = {
        period: {
            start_datetime: startDateUtc,
            end_datetime: endDateUtc,
        },
        campaigns: campaignIds,
        integrations: integrationIds,
        channels: channels,
    }

    return await fetchStat(REVENUE_PER_DAY, {filters})
}
