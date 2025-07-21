import {
    ReportingFilterOperator,
    ReportingParams,
} from 'domains/reporting/models/types'
import {
    PageInteractionsDimension,
    PageInteractionsMeasure,
} from 'domains/reporting/pages/convert/clients/constants'

export type PageInteractionsFilterParams = {
    shopName: string
    shopType: string
    afterDate: string
}

type QueryParams = {
    timezone: string
}

export const getPageInteractionsCountAfterDate = (
    filters: PageInteractionsFilterParams,
    queryParams: QueryParams,
): ReportingParams => {
    return [
        {
            dimensions: [PageInteractionsDimension.shopName],
            measures: [PageInteractionsMeasure.count],
            timezone: queryParams.timezone,
            filters: [
                {
                    member: PageInteractionsDimension.shopName,
                    operator: ReportingFilterOperator.Equals,
                    values: [`${filters.shopType}:${filters.shopName}`],
                },
                {
                    member: PageInteractionsDimension.createdDatetime,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [filters.afterDate],
                },
            ],
        },
    ]
}
