import {Stat, StatsFilters} from 'models/stat/types'
import {fetchStat} from 'models/stat/resources'
import {MESSAGES_PER_CAMPAIGN, REVENUE_PER_DAY} from 'config/stats'
import {RevenueAttributionFilterParams} from 'pages/stats/revenue/clients/types'

export const getCampaignTicketsPerformanceData = async ({
    startDate,
    endDate,
    campaignIds,
}: RevenueAttributionFilterParams): Promise<Stat> => {
    const filters: StatsFilters = {
        period: {
            start_datetime: startDate,
            end_datetime: endDate,
        },
        campaigns: campaignIds,
    }

    return await fetchStat(MESSAGES_PER_CAMPAIGN, {filters})
}

export const getTicketsPerformanceData = async ({
    startDate,
    endDate,
    campaignIds,
    integrationIds,
    channels,
}: RevenueAttributionFilterParams): Promise<Stat> => {
    const filters: StatsFilters = {
        period: {
            start_datetime: startDate,
            end_datetime: endDate,
        },
        campaigns: campaignIds,
        integrations: integrationIds,
        channels: channels,
    }

    return await fetchStat(REVENUE_PER_DAY, {filters})
}
