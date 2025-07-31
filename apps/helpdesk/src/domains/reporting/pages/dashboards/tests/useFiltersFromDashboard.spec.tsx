import React from 'react'

import { renderHook } from '@repo/testing'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { getComponentConfig } from 'domains/reporting/pages/dashboards/config'
import {
    DashboardChildType,
    DashboardSchema,
} from 'domains/reporting/pages/dashboards/types'
import { useFiltersFromDashboard } from 'domains/reporting/pages/dashboards/useFiltersFromDashboard'
import { RootState, StoreDispatch } from 'state/types'
import { assumeMock } from 'utils/testing'

jest.mock('domains/reporting/pages/dashboards/config')
const getComponentConfigMock = assumeMock(getComponentConfig)

const mockConfigs = {
    chart1: {
        reportConfig: {
            reportFilters: {
                persistent: ['persistent_1', 'persistent_2'],
                optional: ['optional_1'],
            },
        },
        chartConfig: {},
    },
    chart2: {
        reportConfig: {
            reportFilters: {
                persistent: ['persistent_1', 'persistent_3'],
                optional: ['optional_2'],
            },
        },
        chartConfig: {},
    },
} as unknown as Record<string, ReturnType<typeof getComponentConfig>>

const mockDashboard = {
    analytics_filter_id: 1,
    children: [],
    name: 'Dashboard',
    emoji: null,
    id: 1,
} satisfies DashboardSchema

const mockStore = configureMockStore<RootState, StoreDispatch>([thunk])

const createInitialState = (hasAutomate: boolean) =>
    ({
        billing: fromJS({
            products: [
                {
                    id: 1,
                    type: 'automation',
                    prices: hasAutomate
                        ? [
                              {
                                  price_id: 'price_1',
                              },
                          ]
                        : [],
                },
            ],
        }),
        currentAccount: fromJS({
            current_subscription: {
                trial_start_datetime: '2017-08-23T01:38:53+00:00',
                trial_end_datetime: '2017-09-06T01:38:53+00:00',
                status: 'trialing',
                start_datetime: '2017-08-23T01:38:53+00:00',
                products: {
                    1: 'price_1',
                },
                scheduled_to_cancel_at: null,
            },
        }),
    }) as RootState

describe('useFiltersFromDashboard(dashboard)', () => {
    const createWrapper =
        (store: any) =>
        ({ children }: { children?: React.ReactNode }) => (
            <Provider store={store}>{children}</Provider>
        )

    beforeEach(() => {
        getComponentConfigMock.mockImplementation((configId) => {
            return mockConfigs[configId] || {}
        })
    })

    it('returns object with persistentFilters and optionalFilters', () => {
        const store = mockStore(createInitialState(false))

        const { result } = renderHook(
            () => useFiltersFromDashboard(mockDashboard),
            {
                wrapper: createWrapper(store),
            },
        )

        expect(result.current.persistentFilters).toBeDefined()
        expect(result.current.optionalFilters).toBeDefined()

        expect(Array.isArray(result.current.persistentFilters)).toBeTruthy()
        expect(Array.isArray(result.current.optionalFilters)).toBeTruthy()
    })

    it('returns empty filters for an empty schema', () => {
        const store = mockStore(createInitialState(false))
        const emptyDashboard = {
            ...mockDashboard,
            children: [],
        }

        const { result } = renderHook(
            () => useFiltersFromDashboard(emptyDashboard),
            {
                wrapper: createWrapper(store),
            },
        )

        expect(result.current.persistentFilters.length).toBe(0)
        expect(result.current.optionalFilters.length).toBe(0)
    })

    it('aggregates filters from charts in the schema', () => {
        const store = mockStore(createInitialState(false))
        const chart1 = {
            type: DashboardChildType.Chart,
            config_id: 'chart1',
            children: [],
        }

        const chart2 = {
            type: DashboardChildType.Chart,
            config_id: 'chart2',
            children: [],
        }

        const dashboard = {
            ...mockDashboard,
            children: [chart1, chart2],
        } satisfies DashboardSchema

        const { result } = renderHook(
            () => useFiltersFromDashboard(dashboard),
            {
                wrapper: createWrapper(store),
            },
        )

        expect(result.current.persistentFilters.length).toBe(3)
        expect(result.current.optionalFilters.length).toBe(2)

        expect(result.current).toEqual(
            expect.objectContaining({
                persistentFilters: expect.arrayContaining([
                    'persistent_1',
                    'persistent_2',
                    'persistent_3',
                ]),
                optionalFilters: expect.arrayContaining([
                    'optional_1',
                    'optional_2',
                ]),
            }),
        )
    })

    it('returns empty filters for unknown chart ID', () => {
        const store = mockStore(createInitialState(false))
        const dashboard = {
            ...mockDashboard,
            children: [
                { type: DashboardChildType.Chart, config_id: 'unknown' },
            ],
        } satisfies DashboardSchema

        const { result } = renderHook(
            () => useFiltersFromDashboard(dashboard),
            {
                wrapper: createWrapper(store),
            },
        )

        expect(result.current.persistentFilters.length).toBe(0)
        expect(result.current.optionalFilters.length).toBe(0)
    })
})
