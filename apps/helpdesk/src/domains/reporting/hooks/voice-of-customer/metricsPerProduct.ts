import {
    createFetchPerDimension,
    createMetricPerDimensionHook,
} from 'domains/reporting/hooks/helpers'
import {
    fetchMetricPerDimensionV2,
    useMetricPerDimension,
    useMetricPerDimensionWithEnrichment,
} from 'domains/reporting/hooks/useMetricPerDimension'
import { returnMentionsPerProductQueryFactory } from 'domains/reporting/models/queryFactories/voice-of-customer/returnMentionsPerProduct'
import { ticketCountPerProductQueryFactory } from 'domains/reporting/models/queryFactories/voice-of-customer/ticketsWithProducts'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { EnrichmentFields } from 'domains/reporting/models/types'
import type { OrderDirection } from 'models/api/types'

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
    productId?: string,
) =>
    useMetricPerDimensionWithEnrichment(
        ticketCountPerProductQueryFactory(statsFilters, timezone, sorting),
        PRODUCT_ENRICHMENT_FIELDS,
        PRODUCT_ENRICHMENT_ENTITY_ID,
        productId,
    )

export const fetchTicketCountPerProduct = createFetchPerDimension(
    ticketCountPerProductQueryFactory,
)

export const useReturnMentionsPerProduct = (
    statsFilters: StatsFilters,
    timezone: string,
    intentCustomFieldId: number,
    sorting?: OrderDirection,
    productId?: string,
) =>
    useMetricPerDimension(
        returnMentionsPerProductQueryFactory(
            statsFilters,
            timezone,
            intentCustomFieldId,
            sorting,
        ),
        productId,
    )

export const useReturnMentionsPerProductWithEnrichment = (
    statsFilters: StatsFilters,
    timezone: string,
    intentsCustomFieldId: number,
    sorting?: OrderDirection,
    productId?: string,
) =>
    useMetricPerDimensionWithEnrichment(
        returnMentionsPerProductQueryFactory(
            statsFilters,
            timezone,
            intentsCustomFieldId,
            sorting,
        ),
        PRODUCT_ENRICHMENT_FIELDS,
        PRODUCT_ENRICHMENT_ENTITY_ID,
        productId,
    )

export const fetchReturnMentionsPerProduct = (
    statsFilters: StatsFilters,
    timezone: string,
    intentCustomFieldId: number,
    sorting?: OrderDirection,
    productId?: string,
) =>
    fetchMetricPerDimensionV2(
        returnMentionsPerProductQueryFactory(
            statsFilters,
            timezone,
            intentCustomFieldId,
            sorting,
        ),
        undefined,
        productId,
    )
