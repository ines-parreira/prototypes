import {
    MetricWithEnrichment,
    useMetricPerDimension,
    useMetricPerDimensionWithEnrichment,
} from 'hooks/reporting/useMetricPerDimension'
import { OrderDirection } from 'models/api/types'
import {
    TicketProductsEnrichedDimension,
    TicketProductsEnrichedMeasure,
} from 'models/reporting/cubes/core/TicketProductsEnrichedCube'
import {
    ticketCountForIntentQueryFactory,
    ticketCountPerIntentForProductQueryFactory,
    TicketsPerIntentOrderField,
} from 'models/reporting/queryFactories/voice-of-customer/ticketCountPerIntent'
import { EnrichmentFields } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'

export const useTicketCountPerIntentForProduct = (
    statsFilters: StatsFilters,
    timezone: string,
    intentCustomFieldId: number,
    productId: string,
    sorting?: OrderDirection,
    intentsCustomFieldValueString?: string,
    sortingField?: TicketsPerIntentOrderField,
) => {
    return useMetricPerDimension(
        ticketCountPerIntentForProductQueryFactory(
            statsFilters,
            timezone,
            intentCustomFieldId,
            productId,
            sorting,
            sortingField,
        ),
        intentsCustomFieldValueString,
    )
}

export const PRODUCT_ENRICHMENT_ENTITY_ID =
    EnrichmentFields.ProductExternalProductId

export const PRODUCT_ENRICHMENT_FIELDS = [
    PRODUCT_ENRICHMENT_ENTITY_ID,
    EnrichmentFields.ProductTitle,
    EnrichmentFields.ProductThumbnailUrl,
]

export const useProductsTicketCountsPerIntentWithEnrichment = (
    statsFilters: StatsFilters,
    timezone: string,
    intentsCustomFieldId: number,
    intentsCustomFieldValueString: string,
    sorting?: OrderDirection,
    limit?: number,
): MetricWithEnrichment<
    TicketProductsEnrichedMeasure,
    TicketProductsEnrichedDimension
> =>
    useMetricPerDimensionWithEnrichment(
        ticketCountForIntentQueryFactory(
            statsFilters,
            timezone,
            intentsCustomFieldId,
            intentsCustomFieldValueString,
            sorting,
            limit,
        ),
        PRODUCT_ENRICHMENT_FIELDS,
        PRODUCT_ENRICHMENT_ENTITY_ID,
    )
