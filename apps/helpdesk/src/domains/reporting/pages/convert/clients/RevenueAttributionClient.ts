import { REVENUE_PER_DAY } from 'domains/reporting/config/stats'
import { fetchStat } from 'domains/reporting/models/stat/resources'
import type {
    LegacyStatsFilters,
    Stat,
} from 'domains/reporting/models/stat/types'
import type { RevenueAttributionFilterParams } from 'domains/reporting/pages/convert/clients/types'
import { getDateRange } from 'domains/reporting/pages/convert/clients/utils'

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
