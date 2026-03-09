import type { ComponentProps } from 'react'
import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import type { Meta, StoryFn } from 'storybook-react-rsbuild'

import type { Tag } from '@gorgias/helpdesk-queries'

import { appQueryClient } from 'api/queryClient'
import { reportingKeys } from 'domains/reporting/models/queries'
import {
    satisfiedOrBreachedTicketsQueryFactory,
    satisfiedOrBreachedTicketsTimeSeriesQueryFactory,
} from 'domains/reporting/models/queryFactories/sla/satisfiedOrBreachedTickets'
import { ServiceLevelAgreements } from 'domains/reporting/pages/sla/ServiceLevelAgreements'
import { initialState } from 'domains/reporting/state/ui/stats/filtersSlice'
import { getCleanStatsFiltersWithLogicalOperatorsWithTimezone } from 'domains/reporting/state/ui/stats/selectors'
import { billingState } from 'fixtures/billing'

const slaPoliciesResponse = {
    object: 'list',
    uri: '/api/sla-policies?',
    data: [
        {
            uuid: 'c489f8ec-0ca8-404b-8c4b-153cb578e212',
            version: 4,
            metrics: [
                {
                    name: 'RT',
                    threshold: 10,
                    unit: 'minute',
                },
            ],
            name: 'Resolution Time Policy',
            priority: '0.263671875',
            target_channels: ['chat'],
            business_hours_only: true,
            created_datetime: '2025-03-26T09:14:58.137932+00:00',
            updated_datetime: null,
            archived_datetime: null,
            deactivated_datetime: null,
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
            filters: {
                ...initialState,
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
            } as Tag,
        ],
    },
    billing: fromJS(billingState),
}

const storyConfig: Meta = {
    title: 'Stats/Reports/SLAs',
    component: ServiceLevelAgreements,
    parameters: {
        chromatic: { disableSnapshot: false },
    },
}

const Template: StoryFn<ComponentProps<typeof ServiceLevelAgreements>> = () => {
    const { cleanStatsFilters, userTimezone, granularity } =
        getCleanStatsFiltersWithLogicalOperatorsWithTimezone(
            defaultState as any,
        )

    appQueryClient.setQueryData(['slaPolicies', 'listSlaPolicies'], {
        data: slaPoliciesResponse,
    })

    appQueryClient.setQueryData(
        reportingKeys.post([
            satisfiedOrBreachedTicketsQueryFactory(
                cleanStatsFilters,
                userTimezone,
            ),
        ]),
        {
            data: achievementRateTrendResponse,
        },
    )

    appQueryClient.setQueryData(
        reportingKeys.post([
            satisfiedOrBreachedTicketsTimeSeriesQueryFactory(
                cleanStatsFilters,
                userTimezone,
                granularity,
            ),
        ]),
        {
            data: achievedAndBreachedResponse,
        },
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
