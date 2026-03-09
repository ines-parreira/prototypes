import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import type { Meta } from 'storybook-react-rsbuild'

import { queryKeys } from '@gorgias/helpdesk-queries'

import { appQueryClient } from 'api/queryClient'
import { AI_MANAGED_TYPES, OBJECT_TYPES } from 'custom-fields/constants'
import { reportingKeys } from 'domains/reporting/models/queries'
import {
    INTENT_DIMENSION,
    PRODUCT_ID_DIMENSION,
    sentimentsTicketCountPerProductQueryFactory,
    TICKET_COUNT_MEASURE,
} from 'domains/reporting/models/queryFactories/voice-of-customer/sentimentPerProduct'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { Sentiment } from 'domains/reporting/models/stat/types'
import { activeParams } from 'domains/reporting/pages/ticket-insights/ticket-fields/CustomFieldSelect'
import { PositiveSentimentsPerProductKpiChart } from 'domains/reporting/pages/voice-of-customer/charts/PositiveSentimentsPerProductKpiChart/PositiveSentimentsPerProductKpiChart'
import {
    filtersSlice,
    initialState as filtersSliceInitialState,
} from 'domains/reporting/state/ui/stats/filtersSlice'
import { SidePanelTab } from 'domains/reporting/state/ui/stats/sidePanelSlice'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

const statsFilters: StatsFilters = {
    period: {
        start_datetime: '2024-01-01T00:00:00+01:00',
        end_datetime: '2024-01-01T23:59:59+01:00',
    },
}
const productId = 123
const sentimentCustomFieldId = 4979
const state = {
    stats: { filters: statsFilters },
    ui: {
        stats: {
            [filtersSlice.name]: {
                ...filtersSliceInitialState,
                cleanStatsFilters: statsFilters,
            },
            sidePanel: {
                isOpen: true,
                product: { id: productId, name: 'Product 1' },
                activeTab: SidePanelTab.TrendOverview,
            },
        },
    },
}

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
            ],
        },
    },
)
appQueryClient.setQueryData(
    reportingKeys.post([
        sentimentsTicketCountPerProductQueryFactory(
            {
                ...statsFilters,
                period: getPreviousPeriod(statsFilters.period),
            },
            'UTC',
            sentimentCustomFieldId,
        ),
    ]),
    {
        data: {
            data: [
                {
                    [PRODUCT_ID_DIMENSION]: productId,
                    [TICKET_COUNT_MEASURE]: 15,
                    [INTENT_DIMENSION]: Sentiment.Negative,
                },
                {
                    [PRODUCT_ID_DIMENSION]: productId,
                    [TICKET_COUNT_MEASURE]: 10,
                    [INTENT_DIMENSION]: Sentiment.Positive,
                },
            ],
        },
    },
)

const storyConfig: Meta = {
    title: 'Stats/VoiceOfCustomer/PositiveSentimentsPerProductKpiChart',
    component: PositiveSentimentsPerProductKpiChart,
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
    return <PositiveSentimentsPerProductKpiChart />
}

export const Default = Template.bind({})

export default storyConfig
