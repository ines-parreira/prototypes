import type { ConvertOrderConversionCube } from 'domains/reporting/models/cubes/ConvertOrderConversionCube'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { FilterKey } from 'domains/reporting/models/stat/types'
import type { ReportingQuery } from 'domains/reporting/models/types'
import type { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { getCampaignOrderPerformanceDrillDownData } from 'domains/reporting/pages/convert/clients/CampaignCubeQueries'
import type { CubeFilterParams } from 'domains/reporting/pages/convert/clients/types'
import type { OrderDirection } from 'models/api/types'

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
