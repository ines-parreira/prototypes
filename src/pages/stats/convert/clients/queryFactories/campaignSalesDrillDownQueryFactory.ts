import {OrderDirection} from 'models/api/types'
import {ReportingQuery} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {getCampaignOrderPerformanceDrillDownData} from 'pages/stats/convert/clients/CampaignCubeQueries'
import {CubeFilterParams} from 'pages/stats/convert/clients/types'
import {ConvertOrderConversionCube} from 'models/reporting/cubes/ConvertOrderConversionCube'

export const campaignSalesDrillDownQueryFactory = (
    shopName: string,
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
): ReportingQuery<ConvertOrderConversionCube> => {
    const filterParams: CubeFilterParams = {
        campaignIds: filters.campaigns,
        startDate: filters.period.start_datetime,
        endDate: filters.period.end_datetime,
        shopName,
        timezone,
        sorting,
    }

    return getCampaignOrderPerformanceDrillDownData(filterParams)
}
