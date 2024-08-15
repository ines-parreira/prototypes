import {OrderDirection} from 'models/api/types'
import {ReportingQuery} from 'models/reporting/types'
import {FilterKey, StatsFilters} from 'models/stat/types'
import {getCampaignOrderPerformanceDrillDownData} from 'pages/stats/convert/clients/CampaignCubeQueries'
import {CubeFilterParams} from 'pages/stats/convert/clients/types'
import {ConvertOrderConversionCube} from 'models/reporting/cubes/ConvertOrderConversionCube'

export const campaignSalesDrillDownQueryFactory = (
    shopName: string,
    selectedCampaignIds: string[],
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    abVariant?: string
): ReportingQuery<ConvertOrderConversionCube> => {
    const campaignIds = Array.isArray(filters[FilterKey.Campaigns])
        ? filters[FilterKey.Campaigns]
        : filters[FilterKey.Campaigns]?.values

    const filterParams: CubeFilterParams = {
        campaignIds:
            selectedCampaignIds.length > 0
                ? selectedCampaignIds
                : campaignIds || [],
        startDate: filters.period.start_datetime,
        endDate: filters.period.end_datetime,
        abVariant,
        shopName,
        timezone,
        sorting,
    }

    return getCampaignOrderPerformanceDrillDownData(filterParams)
}
