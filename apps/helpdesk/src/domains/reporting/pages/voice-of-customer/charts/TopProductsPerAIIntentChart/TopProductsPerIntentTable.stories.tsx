import { QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import type { Meta } from 'storybook-react-rsbuild'

import { appQueryClient } from 'api/queryClient'
import product1 from 'domains/reporting/assets/img/voc-preview/product_01.png'
import product2 from 'domains/reporting/assets/img/voc-preview/product_02.png'
import product3 from 'domains/reporting/assets/img/voc-preview/product_03.png'
import product4 from 'domains/reporting/assets/img/voc-preview/product_04.png'
import {
    PRODUCT_ENRICHMENT_ENTITY_ID,
    PRODUCT_ENRICHMENT_FIELDS,
} from 'domains/reporting/hooks/voice-of-customer/metricsPerProductAndIntent'
import { PRODUCTS_PER_INTENT_LIMIT } from 'domains/reporting/hooks/voice-of-customer/useProductsTicketCountsPerIntentDistribution'
import { withEnrichment } from 'domains/reporting/hooks/withEnrichment'
import {
    TicketProductsEnrichedDimension,
    TicketProductsEnrichedMeasure,
} from 'domains/reporting/models/cubes/core/TicketProductsEnrichedCube'
import {
    TicketCustomFieldsDimension,
    TicketCustomFieldsMeasure,
} from 'domains/reporting/models/cubes/TicketCustomFieldsCube'
import type { UseEnrichedPostReportingQueryData } from 'domains/reporting/models/queries'
import { reportingKeys } from 'domains/reporting/models/queries'
import { customFieldsTicketCountWithSortQueryFactory } from 'domains/reporting/models/queryFactories/ticket-insights/customFieldsTicketCount'
import { ticketCountForIntentQueryFactory } from 'domains/reporting/models/queryFactories/voice-of-customer/ticketCountPerIntent'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { EnrichmentFields } from 'domains/reporting/models/types'
import { TopProductsPerIntentTable } from 'domains/reporting/pages/voice-of-customer/charts/TopProductsPerAIIntentChart/TopProductsPerIntentTable'
import { DEFAULT_SORTING_DIRECTION } from 'domains/reporting/pages/voice-of-customer/constants'
import {
    filtersSlice,
    initialState as filtersSliceInitialState,
} from 'domains/reporting/state/ui/stats/filtersSlice'
import {
    initialState,
    productsPerTicketSlice,
} from 'domains/reporting/state/ui/stats/productsPerTicketSlice'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

const statsFilters: StatsFilters = {
    period: {
        start_datetime: '2024-01-01T00:00:00+01:00',
        end_datetime: '2024-01-01T23:59:59+01:00',
    },
}

const intentCustomFieldId = 789
const state = {
    stats: { filters: statsFilters },
    ui: {
        stats: {
            [filtersSlice.name]: {
                ...filtersSliceInitialState,
                cleanStatsFilters: statsFilters,
            },
            statsTables: {
                [productsPerTicketSlice.name]: initialState,
            },
        },
    },
}

const TICKET_CUSTOM_FIELDS_VALUE = 'Order :: Status :: Other'

const mockAllData = [
    {
        [TicketCustomFieldsDimension.TicketCustomFieldsValue]:
            TICKET_CUSTOM_FIELDS_VALUE,
        [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]: '38',
        decile: '0.8',
    },
    {
        [TicketCustomFieldsDimension.TicketCustomFieldsValue]:
            '"Other :: No Reply :: Other"',
        [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]: '6',
        decile: '0.4',
    },
    {
        [TicketCustomFieldsDimension.TicketCustomFieldsValue]:
            '"Other :: Other :: Other"',
        [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]: '12',
        decile: '0.8',
    },
]

const mockPreviousPeriodAllData = [
    {
        [TicketCustomFieldsDimension.TicketCustomFieldsValue]:
            TICKET_CUSTOM_FIELDS_VALUE,
        [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]: '10',
        decile: '0.7',
    },
    {
        [TicketCustomFieldsDimension.TicketCustomFieldsValue]:
            '"Other :: No Reply :: Other"',
        [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]: '2',
        decile: '0.2',
    },
    {
        [TicketCustomFieldsDimension.TicketCustomFieldsValue]:
            '"Other :: Other :: Other"',
        [TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]: '12',
        decile: '0.8',
    },
]

// Mock current period data
appQueryClient.setQueryData(
    reportingKeys.post([
        customFieldsTicketCountWithSortQueryFactory(
            statsFilters,
            'UTC',
            intentCustomFieldId,
            DEFAULT_SORTING_DIRECTION,
            TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount,
        ),
    ]),
    {
        data: {
            data: mockAllData,
        },
        isFetching: false,
        isError: false,
    },
)

// Mock previous period data
appQueryClient.setQueryData(
    reportingKeys.post([
        customFieldsTicketCountWithSortQueryFactory(
            {
                ...statsFilters,
                period: getPreviousPeriod(statsFilters.period),
            },
            'UTC',
            intentCustomFieldId,
            DEFAULT_SORTING_DIRECTION,
            TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount,
        ),
    ]),
    {
        data: {
            data: mockPreviousPeriodAllData,
        },
        isFetching: false,
        isError: false,
    },
)

const ENRICHMENT_DATA = {
    data: [
        {
            [TicketProductsEnrichedDimension.ProductId]: 'PROD-12345',
            [TicketProductsEnrichedDimension.StoreId]: '1001',
            [TicketProductsEnrichedMeasure.TicketCount]: '30',
        },
        {
            [TicketProductsEnrichedDimension.ProductId]: 'PROD-67890',
            [TicketProductsEnrichedDimension.StoreId]: '1001',
            [TicketProductsEnrichedMeasure.TicketCount]: '8',
        },
    ],
    enrichment: [
        {
            'Product.externalId': 'PROD-12345',
            'Product.storeIntegrationId': 1001,
            [EnrichmentFields.ProductTitle]: 'Premium Wireless Headphones',
            [EnrichmentFields.ProductThumbnailUrl]: product1,
            [EnrichmentFields.ProductExternalProductId]: 'PROD-12345',
        },
        {
            'Product.externalId': 'PROD-67890',
            'Product.storeIntegrationId': 1001,
            [EnrichmentFields.ProductTitle]: 'Bluetooth Speaker Pro',
            [EnrichmentFields.ProductThumbnailUrl]: product2,
            [EnrichmentFields.ProductExternalProductId]: 'PROD-67890',
        },
    ],
}

const ENRICHMENT_DATA_PREVIOUS_PERIOD = {
    data: [
        {
            [TicketProductsEnrichedDimension.ProductId]: 'PROD-12345',
            [TicketProductsEnrichedDimension.StoreId]: '1001',
            [TicketProductsEnrichedMeasure.TicketCount]: '15',
        },
        {
            [TicketProductsEnrichedDimension.ProductId]: 'PROD-67890',
            [TicketProductsEnrichedDimension.StoreId]: '1002',
            [TicketProductsEnrichedMeasure.TicketCount]: '27',
        },
    ],
    enrichment: [
        {
            'Product.externalId': 'PROD-12345',
            'Product.storeIntegrationId': 1001,
            [EnrichmentFields.ProductTitle]: 'Bluetooth Speaker Pro',
            [EnrichmentFields.ProductThumbnailUrl]: product3,
            [EnrichmentFields.ProductExternalProductId]: 'PROD-12345',
        },
        {
            'Product.externalId': 'PROD-67890',
            'Product.storeIntegrationId': 1002,
            [EnrichmentFields.ProductTitle]: 'Smart Fitness Tracker',
            [EnrichmentFields.ProductThumbnailUrl]: product4,
            [EnrichmentFields.ProductExternalProductId]: 'PROD-67890',
        },
    ],
}

const PRODUCT_ID_DIMENSION = TicketProductsEnrichedDimension.ProductId

// Mock current period data for products
appQueryClient.setQueryData(
    reportingKeys.postEnriched({
        query: ticketCountForIntentQueryFactory(
            statsFilters,
            'UTC',
            intentCustomFieldId,
            TICKET_CUSTOM_FIELDS_VALUE,
            undefined,
            PRODUCTS_PER_INTENT_LIMIT,
        ),
        enrichment_fields: PRODUCT_ENRICHMENT_FIELDS,
    }),
    withEnrichment(
        {
            data: ENRICHMENT_DATA,
        } as UseEnrichedPostReportingQueryData<any>,
        PRODUCT_ID_DIMENSION,
        PRODUCT_ENRICHMENT_FIELDS,
        PRODUCT_ENRICHMENT_ENTITY_ID,
    ),
)

// Mock previous period data for products
appQueryClient.setQueryData(
    reportingKeys.postEnriched({
        query: ticketCountForIntentQueryFactory(
            {
                ...statsFilters,
                period: getPreviousPeriod(statsFilters.period),
            },
            'UTC',
            intentCustomFieldId,
            TICKET_CUSTOM_FIELDS_VALUE,
            undefined,
            PRODUCTS_PER_INTENT_LIMIT,
        ),
        enrichment_fields: PRODUCT_ENRICHMENT_FIELDS,
    }),
    withEnrichment(
        {
            data: ENRICHMENT_DATA_PREVIOUS_PERIOD,
        } as UseEnrichedPostReportingQueryData<any>,
        PRODUCT_ID_DIMENSION,
        PRODUCT_ENRICHMENT_FIELDS,
        PRODUCT_ENRICHMENT_ENTITY_ID,
    ),
)

const storyConfig: Meta = {
    title: 'Stats/VoiceOfCustomer/TopProductsPerIntentTable',
    component: TopProductsPerIntentTable,
    parameters: {
        chromatic: { disableSnapshot: false },
    },
    decorators: [
        (Story) => (
            <QueryClientProvider client={appQueryClient}>
                <Provider store={configureMockStore([thunk])(state)}>
                    <Story />
                </Provider>
            </QueryClientProvider>
        ),
    ],
}

const Template = () => {
    return (
        <TopProductsPerIntentTable intentCustomFieldId={intentCustomFieldId} />
    )
}

export const Default = Template.bind({})

export default storyConfig
