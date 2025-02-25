import { REVENUE_PER_DAY } from 'config/stats'
import { fetchStat } from 'models/stat/resources'
import { LegacyStatsFilters, Stat } from 'models/stat/types'
import { RevenueAttributionFilterParams } from 'pages/stats/convert/clients/types'
import { getDateRange } from 'pages/stats/convert/clients/utils'

export const getTicketsPerformanceData = async ({
    startDate,
    endDate,
    campaignIds,
    integrationIds,
    channels,
}: RevenueAttributionFilterParams): Promise<Stat> => {
    const [startDateUtc, endDateUtc] = getDateRange(startDate, endDate)
    const filters: LegacyStatsFilters = {
        period: {
            start_datetime: startDateUtc,
            end_datetime: endDateUtc,
        },
        campaigns: campaignIds,
        integrations: integrationIds,
        channels: channels,
    }

    return await fetchStat(REVENUE_PER_DAY, { filters })
}
