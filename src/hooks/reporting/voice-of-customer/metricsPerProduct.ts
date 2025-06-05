import {
    createFetchPerDimension,
    createMetricPerDimensionHook,
} from 'hooks/reporting/helpers'
import {
    fetchMetricPerDimension,
    useMetricPerDimension,
    useMetricPerDimensionWithEnrichment,
} from 'hooks/reporting/useMetricPerDimension'
import { OrderDirection } from 'models/api/types'
import { returnMentionsPerProductQueryFactory } from 'models/reporting/queryFactories/voice-of-customer/returnMentionsPerProduct'
import { ticketCountPerProductQueryFactory } from 'models/reporting/queryFactories/voice-of-customer/ticketsWithProducts'
import { EnrichmentFields } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'

export const useTicketCountPerProduct = createMetricPerDimensionHook(
    ticketCountPerProductQueryFactory,
)

export type ProductEnrichmentFields =
    | EnrichmentFields.ProductExternalProductId
    | EnrichmentFields.ProductTitle
    | EnrichmentFields.ProductThumbnailUrl

export const PRODUCT_ENRICHMENT_ENTITY_ID =
    EnrichmentFields.ProductExternalProductId

export const PRODUCT_ENRICHMENT_FIELDS: ProductEnrichmentFields[] = [
    PRODUCT_ENRICHMENT_ENTITY_ID,
    EnrichmentFields.ProductTitle,
    EnrichmentFields.ProductThumbnailUrl,
]

export const useTicketCountPerProductWithEnrichment = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
) =>
    useMetricPerDimensionWithEnrichment(
        ticketCountPerProductQueryFactory(statsFilters, timezone, sorting),
        PRODUCT_ENRICHMENT_FIELDS,
        PRODUCT_ENRICHMENT_ENTITY_ID,
    )

export const fetchTicketCountPerProduct = createFetchPerDimension(
    ticketCountPerProductQueryFactory,
)

export const useReturnMentionsPerProduct = (
    statsFilters: StatsFilters,
    timezone: string,
    intentsCustomFieldId: string,
    sorting?: OrderDirection,
    productId?: string,
) =>
    useMetricPerDimension(
        returnMentionsPerProductQueryFactory(
            statsFilters,
            timezone,
            intentsCustomFieldId,
            sorting,
        ),
        productId,
    )

export const fetchReturnMentionsPerProduct = (
    statsFilters: StatsFilters,
    timezone: string,
    intentsCustomFieldId: string,
    sorting?: OrderDirection,
    productId?: string,
) =>
    fetchMetricPerDimension(
        returnMentionsPerProductQueryFactory(
            statsFilters,
            timezone,
            intentsCustomFieldId,
            sorting,
        ),
        productId,
    )
