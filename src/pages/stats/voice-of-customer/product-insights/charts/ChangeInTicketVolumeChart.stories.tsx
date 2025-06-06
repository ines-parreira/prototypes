import React from 'react'

import { Meta } from '@storybook/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { appQueryClient } from 'api/queryClient'
import {
    PRODUCT_ENRICHMENT_ENTITY_ID,
    PRODUCT_ENRICHMENT_FIELDS,
    ProductEnrichmentFields,
} from 'hooks/reporting/voice-of-customer/metricsPerProduct'
import { withEnrichment } from 'hooks/reporting/withEnrichment'
import { OrderDirection } from 'models/api/types'
import {
    TicketProductsEnrichedDimension,
    TicketProductsEnrichedMeasure,
} from 'models/reporting/cubes/core/TicketProductsEnrichedCube'
import {
    reportingKeys,
    UseEnrichedPostReportingQueryData,
} from 'models/reporting/queries'
import { PRODUCT_ID_DIMENSION } from 'models/reporting/queryFactories/voice-of-customer/sentimentPerProduct'
import { ticketCountPerProductQueryFactory } from 'models/reporting/queryFactories/voice-of-customer/ticketsWithProducts'
import { EnrichmentFields } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import { ChangeInTicketVolumeChart } from 'pages/stats/voice-of-customer/product-insights/charts/ChangeInTicketVolumeChart'
import {
    filtersSlice,
    initialState as filtersSliceInitialState,
} from 'state/ui/stats/filtersSlice'
import {
    initialState,
    PRODUCT_NAME_FIELD,
    productsPerTicketSlice,
} from 'state/ui/stats/productsPerTicketSlice'
import { getPreviousPeriod } from 'utils/reporting'

const statsFilters: StatsFilters = {
    period: {
        start_datetime: '2024-01-01T00:00:00+01:00',
        end_datetime: '2024-01-01T23:59:59+01:00',
    },
}
const productId = 123
const anotherProductId = 456
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
                        [EnrichmentFields.ProductThumbnailUrl]: 'undefined',
                    },
                    {
                        [PRODUCT_ENRICHMENT_ENTITY_ID]: anotherProductId,
                        [PRODUCT_NAME_FIELD]: 'Some other name',
                        [EnrichmentFields.ProductThumbnailUrl]: 'undefined',
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
    reportingKeys.postEnriched({
        query: ticketCountPerProductQueryFactory(
            {
                ...statsFilters,
                period: getPreviousPeriod(statsFilters.period),
            },
            'UTC',
            OrderDirection.Desc,
        ),
        enrichment_fields: PRODUCT_ENRICHMENT_FIELDS,
    }),
    withEnrichment(
        {
            data: {
                data: [
                    {
                        [TicketProductsEnrichedMeasure.TicketCount]: String(20),
                        [PRODUCT_ID_DIMENSION]: String(productId),
                        [TicketProductsEnrichedDimension.StoreId]: String(33),
                    },
                    {
                        [TicketProductsEnrichedMeasure.TicketCount]: String(40),
                        [PRODUCT_ID_DIMENSION]: String(anotherProductId),
                        [TicketProductsEnrichedDimension.StoreId]: String(24),
                    },
                ],
                enrichment: [
                    {
                        [PRODUCT_ENRICHMENT_ENTITY_ID]: productId,
                        [PRODUCT_NAME_FIELD]: 'Some name',
                        [EnrichmentFields.ProductThumbnailUrl]: 'undefined',
                    },
                    {
                        [PRODUCT_ENRICHMENT_ENTITY_ID]: anotherProductId,
                        [PRODUCT_NAME_FIELD]: 'Some other name',
                        [EnrichmentFields.ProductThumbnailUrl]: 'undefined',
                    },
                ],
            },
        } as UseEnrichedPostReportingQueryData<any>,
        PRODUCT_ID_DIMENSION,
        PRODUCT_ENRICHMENT_FIELDS,
        PRODUCT_ENRICHMENT_ENTITY_ID,
    ),
)

const storyConfig: Meta = {
    title: 'Stats/VoiceOfCustomer/ChangeInTicketVolumeChart',
    component: ChangeInTicketVolumeChart,
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
    return <ChangeInTicketVolumeChart />
}

export const Default = Template.bind({})

export default storyConfig
