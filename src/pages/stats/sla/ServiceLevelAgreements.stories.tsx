import React, {ComponentProps} from 'react'
import {QueryClientProvider} from '@tanstack/react-query'
import {Meta, StoryFn} from '@storybook/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'

import {appQueryClient} from 'api/queryClient'

import ServiceLevelAgreements from 'pages/stats/sla/ServiceLevelAgreements'

import {reportingKeys} from 'models/reporting/queries'
import {
    satisfiedOrBreachedTicketsQueryFactory,
    satisfiedOrBreachedTicketsTimeSeriesQueryFactory,
} from 'models/reporting/queryFactories/sla/satisfiedOrBreachedTickets'
import {getCleanStatsFiltersWithTimezone} from 'state/ui/stats/selectors'

const slaPoliciesResponse = {
    object: 'list',
    uri: '/api/sla-policies?',
    data: [
        {
            uuid: '1dab6138-33c8-4b88-bb52-71bebc930996',
            version: 1,
            metrics: [
                {
                    name: 'FRT',
                    threshold: 2,
                    unit: 'hour',
                },
                {
                    name: 'RT',
                    threshold: 20,
                    unit: 'hour',
                },
            ],
            name: 'All Email',
            priority: '0.75',
            target_channels: ['email'],
            created_datetime: '2024-06-05T13:35:37.880220+00:00',
        },
    ],
}

const achievementRateTrendResponse = {
    data: [
        {
            'TicketSLA.slaStatus': 'SATISFIED',
            'TicketSLA.slaAnchorDatetime.day': '2024-07-26T00:00:00.000',
            'TicketSLA.slaAnchorDatetime': '2024-07-26T00:00:00.000',
            'TicketSLA.ticketCount': '464',
        },
        {
            'TicketSLA.slaStatus': 'BREACHED',
            'TicketSLA.slaAnchorDatetime.day': '2024-07-26T00:00:00.000',
            'TicketSLA.slaAnchorDatetime': '2024-07-26T00:00:00.000',
            'TicketSLA.ticketCount': '268',
        },
    ],
}

const achievedAndBreachedResponse = {
    query: {
        filters: [
            {
                member: 'TicketEnriched.periodStart',
                operator: 'afterDate',
                values: ['2024-07-19T00:00:00.000'],
            },
            {
                member: 'TicketEnriched.periodEnd',
                operator: 'beforeDate',
                values: ['2024-07-26T23:59:59.000'],
            },
        ],
    },
    data: [
        {
            'TicketSLA.slaStatus': 'SATISFIED',
            'TicketSLA.ticketCount': '2929',
        },
        {
            'TicketSLA.slaStatus': 'BREACHED',
            'TicketSLA.ticketCount': '3000',
        },
    ],
}

const defaultState = {
    stats: {
        filters: {
            period: {
                start_datetime: '2024-07-26T00:00:00.000',
                end_datetime: '2024-08-01T23:59:59.000',
            },
        },
    },
    ui: {
        stats: {
            isFilterDirty: false,
            cleanStatsFilters: {
                period: {
                    start_datetime: '2024-07-26T00:00:00.000',
                    end_datetime: '2024-08-01T23:59:59.000',
                },
            },
        },
        drillDown: {
            isOpen: false,
        },
    },
    entities: {},
    tags: {
        items: [
            {
                created_datetime: '2024-03-12T13:47:03.520194+00:00',
                decoration: {
                    color: '#0dc008',
                },
                deleted_datetime: null,
                description: null,
                id: 641396,
                name: 'ai_wait',
                uri: '/api/tags/641396/',
                usage: 132,
            },
        ],
    },
}

const storyConfig: Meta = {
    title: 'Stats/Reports/SLAs',
    component: ServiceLevelAgreements,
    parameters: {
        chromatic: {disableSnapshot: false},
    },
}

const Template: StoryFn<ComponentProps<typeof ServiceLevelAgreements>> = () => {
    const {cleanStatsFilters, userTimezone, granularity} =
        getCleanStatsFiltersWithTimezone(defaultState as any)

    appQueryClient.setQueryData(
        ['slaPolicies', 'listSlaPolicies', {queryParams: undefined}],
        {
            data: slaPoliciesResponse,
        }
    )

    appQueryClient.setQueryData(
        reportingKeys.post([
            satisfiedOrBreachedTicketsQueryFactory(
                cleanStatsFilters,
                userTimezone
            ),
        ]),
        {
            data: achievementRateTrendResponse,
        }
    )

    appQueryClient.setQueryData(
        reportingKeys.post([
            satisfiedOrBreachedTicketsTimeSeriesQueryFactory(
                cleanStatsFilters,
                userTimezone,
                granularity
            ),
        ]),
        {
            data: achievedAndBreachedResponse,
        }
    )

    return (
        <QueryClientProvider client={appQueryClient}>
            <Provider store={configureMockStore([thunk])(defaultState)}>
                <ServiceLevelAgreements />
            </Provider>
        </QueryClientProvider>
    )
}

export const Default = Template.bind({})

export default storyConfig
