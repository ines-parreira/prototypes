import { QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import type { Meta } from 'storybook-react-rsbuild'

import { queryKeys } from '@gorgias/helpdesk-queries'

import { appQueryClient } from 'api/queryClient'
import { AI_MANAGED_TYPES, OBJECT_TYPES } from 'custom-fields/constants'
import product1 from 'domains/reporting/assets/img/voc-preview/product_01.png'
import product2 from 'domains/reporting/assets/img/voc-preview/product_02.png'
import type { ProductEnrichmentFields } from 'domains/reporting/hooks/voice-of-customer/metricsPerProduct'
import {
    PRODUCT_ENRICHMENT_ENTITY_ID,
    PRODUCT_ENRICHMENT_FIELDS,
} from 'domains/reporting/hooks/voice-of-customer/metricsPerProduct'
import { INTENT_DIMENSION } from 'domains/reporting/hooks/voice-of-customer/useTopIntentPerProduct'
import { withEnrichment } from 'domains/reporting/hooks/withEnrichment'
import {
    TicketProductsEnrichedDimension,
    TicketProductsEnrichedMeasure,
} from 'domains/reporting/models/cubes/core/TicketProductsEnrichedCube'
import type { UseEnrichedPostReportingQueryData } from 'domains/reporting/models/queries'
import { reportingKeys } from 'domains/reporting/models/queries'
import { TICKET_CUSTOM_FIELDS_API_SEPARATOR } from 'domains/reporting/models/queryFactories/utils'
import { ticketCountPerProductAndIntentQueryFactory } from 'domains/reporting/models/queryFactories/voice-of-customer/intentPerProductQueryFactory'
import { returnMentionsPerProductQueryFactory } from 'domains/reporting/models/queryFactories/voice-of-customer/returnMentionsPerProduct'
import {
    PRODUCT_ID_DIMENSION,
    sentimentsTicketCountPerProductQueryFactory,
    TICKET_COUNT_MEASURE,
} from 'domains/reporting/models/queryFactories/voice-of-customer/sentimentPerProduct'
import { ticketCountPerProductQueryFactory } from 'domains/reporting/models/queryFactories/voice-of-customer/ticketsWithProducts'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { Sentiment } from 'domains/reporting/models/stat/types'
import { EnrichmentFields } from 'domains/reporting/models/types'
import { activeParams } from 'domains/reporting/pages/ticket-insights/ticket-fields/CustomFieldSelect'
import { ProductInsightsTableChart } from 'domains/reporting/pages/voice-of-customer/charts/ProductInsightsTableChart/ProductInsightsTableChart'
import { PRODUCT_INSIGHTS_SLICE_NAME } from 'domains/reporting/state/ui/stats/constants'
import {
    filtersSlice,
    initialState as filtersSliceInitialState,
} from 'domains/reporting/state/ui/stats/filtersSlice'
import { initialState as productInsightsInitialState } from 'domains/reporting/state/ui/stats/productInsightsSlice'
import { PRODUCT_NAME_FIELD } from 'domains/reporting/state/ui/stats/productsPerTicketSlice'
import { OrderDirection } from 'models/api/types'
import configureStore from 'store/configureStore'
import type { InitialRootState } from 'types'

const productId = 'some-product-id'
const anotherProductId = 'another-product-id'
const sentimentCustomFieldId = 4979
const intentCustomFieldId = 5555
const statsFilters: StatsFilters = {
    period: {
        start_datetime: '2024-01-01T00:00:00+01:00',
        end_datetime: '2024-01-01T23:59:59+01:00',
    },
}

const state = {
    stats: { filters: statsFilters },
    ui: {
        stats: {
            [filtersSlice.name]: {
                ...filtersSliceInitialState,
                cleanStatsFilters: statsFilters,
            },
            statsTables: {
                [PRODUCT_INSIGHTS_SLICE_NAME]: productInsightsInitialState,
            },
        },
    },
} as unknown as InitialRootState

const store = configureStore(state)

export const sentimentCustomFieldsMockResponse = {
    object: 'list',
    uri: '/api/custom-fields/?archived=false&object_type=Ticket',
    data: [
        {
            id: sentimentCustomFieldId,
            external_id: null,
            object_type: OBJECT_TYPES.TICKET,
            label: 'Sentiment',
            description: 'Ticket Sentiment',
            priority: 7,
            required: false,
            managed_type: AI_MANAGED_TYPES.MANAGED_SENTIMENT,
            definition: {
                input_settings: {
                    choices: ['Positive', 'Negative'],
                    input_type: 'dropdown',
                },
                data_type: 'text',
            },
            created_datetime: '2024-07-15T17:05:25.778110+00:00',
            updated_datetime: '2024-07-15T17:05:25.778116+00:00',
            deactivated_datetime: null,
        },
        {
            id: intentCustomFieldId,
            external_id: null,
            object_type: OBJECT_TYPES.TICKET,
            label: 'Intent',
            description: 'Intent',
            priority: 7,
            required: false,
            managed_type: AI_MANAGED_TYPES.AI_INTENT,
            definition: {
                input_settings: {
                    choices: ['Positive', 'Negative'],
                    input_type: 'dropdown',
                },
                data_type: 'text',
            },
            created_datetime: '2024-07-15T17:05:25.778110+00:00',
            updated_datetime: '2024-07-15T17:05:25.778116+00:00',
            deactivated_datetime: null,
        },
    ],
    meta: {
        prev_cursor: null,
        next_cursor: null,
    },
}

appQueryClient.setQueryData(
    queryKeys.customFields.listCustomFields(activeParams),
    {
        data: sentimentCustomFieldsMockResponse,
    },
)

appQueryClient.setQueryData(
    reportingKeys.postEnriched({
        query: ticketCountPerProductQueryFactory(
            statsFilters,
            'UTC',
            OrderDirection.Desc,
        ),
        enrichment_fields: PRODUCT_ENRICHMENT_FIELDS,
    }),
    withEnrichment<
        | TicketProductsEnrichedMeasure.TicketCount
        | typeof PRODUCT_ID_DIMENSION
        | TicketProductsEnrichedDimension.StoreId,
        ProductEnrichmentFields,
        typeof PRODUCT_ID_DIMENSION,
        typeof PRODUCT_ENRICHMENT_ENTITY_ID
    >(
        {
            data: {
                data: [
                    {
                        [TicketProductsEnrichedMeasure.TicketCount]: String(50),
                        [PRODUCT_ID_DIMENSION]: String(productId),
                        [TicketProductsEnrichedDimension.StoreId]: String(33),
                    },
                    {
                        [TicketProductsEnrichedMeasure.TicketCount]: String(30),
                        [PRODUCT_ID_DIMENSION]: String(anotherProductId),
                        [TicketProductsEnrichedDimension.StoreId]: String(24),
                    },
                ],
                enrichment: [
                    {
                        [PRODUCT_ENRICHMENT_ENTITY_ID]: productId,
                        [PRODUCT_NAME_FIELD]: 'Some name',
                        [EnrichmentFields.ProductThumbnailUrl]: product1,
                    },
                    {
                        [PRODUCT_ENRICHMENT_ENTITY_ID]: anotherProductId,
                        [PRODUCT_NAME_FIELD]: 'Some other name',
                        [EnrichmentFields.ProductThumbnailUrl]: product2,
                    },
                ],
            },
        } as UseEnrichedPostReportingQueryData<any>,
        PRODUCT_ID_DIMENSION,
        PRODUCT_ENRICHMENT_FIELDS,
        PRODUCT_ENRICHMENT_ENTITY_ID,
    ),
)

appQueryClient.setQueryData(
    reportingKeys.post([
        ticketCountPerProductAndIntentQueryFactory(
            statsFilters,
            'UTC',
            String(intentCustomFieldId),
        ),
    ]),
    {
        data: {
            data: [
                {
                    [TicketProductsEnrichedMeasure.TicketCount]: String(50),
                    [PRODUCT_ID_DIMENSION]: productId,
                    [INTENT_DIMENSION]: `Some${TICKET_CUSTOM_FIELDS_API_SEPARATOR}name${TICKET_CUSTOM_FIELDS_API_SEPARATOR}intent`,
                },
                {
                    [TicketProductsEnrichedMeasure.TicketCount]: String(30),
                    [PRODUCT_ID_DIMENSION]: anotherProductId,
                    [INTENT_DIMENSION]: `Some${TICKET_CUSTOM_FIELDS_API_SEPARATOR}other${TICKET_CUSTOM_FIELDS_API_SEPARATOR}intent`,
                },
            ],
        },
    },
)

appQueryClient.setQueryData(
    reportingKeys.post([
        returnMentionsPerProductQueryFactory(
            statsFilters,
            'UTC',
            intentCustomFieldId,
            OrderDirection.Desc,
        ),
    ]),
    {
        data: {
            data: [
                {
                    [TicketProductsEnrichedMeasure.TicketCount]: String(50),
                    [PRODUCT_ID_DIMENSION]: productId,
                    [INTENT_DIMENSION]: `Return${TICKET_CUSTOM_FIELDS_API_SEPARATOR}name${TICKET_CUSTOM_FIELDS_API_SEPARATOR}intent`,
                },
                {
                    [TicketProductsEnrichedMeasure.TicketCount]: String(30),
                    [PRODUCT_ID_DIMENSION]: anotherProductId,
                    [INTENT_DIMENSION]: `Return${TICKET_CUSTOM_FIELDS_API_SEPARATOR}other${TICKET_CUSTOM_FIELDS_API_SEPARATOR}intent`,
                },
            ],
        },
    },
)

appQueryClient.setQueryData(
    reportingKeys.post([
        sentimentsTicketCountPerProductQueryFactory(
            statsFilters,
            'UTC',
            sentimentCustomFieldId,
        ),
    ]),
    {
        data: {
            data: [
                {
                    [PRODUCT_ID_DIMENSION]: productId,
                    [TICKET_COUNT_MEASURE]: 33,
                    [INTENT_DIMENSION]: Sentiment.Negative,
                },
                {
                    [PRODUCT_ID_DIMENSION]: productId,
                    [TICKET_COUNT_MEASURE]: 24,
                    [INTENT_DIMENSION]: Sentiment.Positive,
                },
                {
                    [PRODUCT_ID_DIMENSION]: anotherProductId,
                    [TICKET_COUNT_MEASURE]: 22,
                    [INTENT_DIMENSION]: Sentiment.Negative,
                },
                {
                    [PRODUCT_ID_DIMENSION]: anotherProductId,
                    [TICKET_COUNT_MEASURE]: 11,
                    [INTENT_DIMENSION]: Sentiment.Positive,
                },
            ],
        },
    },
)

const storyConfig: Meta = {
    title: 'Stats/VoiceOfCustomer/ProductInsightsTableChart',
    component: ProductInsightsTableChart,
    parameters: {
        chromatic: { disableSnapshot: false },
    },
    decorators: [
        (Story) => (
            <QueryClientProvider client={appQueryClient}>
                <Provider store={store}>
                    <Story />
                </Provider>
            </QueryClientProvider>
        ),
    ],
}

const Template = () => {
    return <ProductInsightsTableChart />
}

export const Default = Template.bind({})

export default storyConfig
