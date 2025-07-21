import { ConvertOrderConversionCube } from 'domains/reporting/models/cubes/ConvertOrderConversionCube'
import { FilterKey, StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingQuery } from 'domains/reporting/models/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { getCampaignOrderPerformanceDrillDownData } from 'domains/reporting/pages/convert/clients/CampaignCubeQueries'
import { CubeFilterParams } from 'domains/reporting/pages/convert/clients/types'
import { OrderDirection } from 'models/api/types'

export const campaignSalesDrillDownQueryFactory = (
    shopName: string,
    selectedCampaignIds: string[],
    campaignsOperator: LogicalOperatorEnum,
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
    abVariant?: string,
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
        campaignsOperator,
        abVariant,
        shopName,
        timezone,
        sorting,
    }

    return getCampaignOrderPerformanceDrillDownData(filterParams)
}
