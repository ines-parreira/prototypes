import {Stat, StatsFilters} from 'models/stat/types'
import {fetchStat} from 'models/stat/resources'
import {MESSAGES_PER_CAMPAIGN} from 'config/stats'
import {FilterParams} from 'pages/stats/revenue/clients/types'

export const getCampaignTicketsPerformanceData = async ({
    startDate,
    endDate,
    campaignIds,
}: FilterParams): Promise<Stat> => {
    const filters: StatsFilters = {
        period: {
            start_datetime: startDate,
            end_datetime: endDate,
        },
        campaigns: campaignIds,
    }

    return await fetchStat(MESSAGES_PER_CAMPAIGN, {filters})
}
