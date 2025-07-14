import {
    MetricWithEnrichment,
    useMetricPerDimension,
    useMetricPerDimensionWithEnrichment,
} from 'domains/reporting/hooks/useMetricPerDimension'
import {
    TicketProductsEnrichedDimension,
    TicketProductsEnrichedMeasure,
} from 'domains/reporting/models/cubes/core/TicketProductsEnrichedCube'
import {
    ticketCountForIntentQueryFactory,
    ticketCountPerIntentForProductQueryFactory,
    TicketsPerIntentOrderField,
} from 'domains/reporting/models/queryFactories/voice-of-customer/ticketCountPerIntent'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { EnrichmentFields } from 'domains/reporting/models/types'
import { OrderDirection } from 'models/api/types'

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
