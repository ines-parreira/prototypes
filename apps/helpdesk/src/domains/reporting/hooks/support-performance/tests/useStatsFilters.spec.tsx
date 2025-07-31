import React from 'react'

import { renderHook } from '@repo/testing'
import moment from 'moment'
import { Provider } from 'react-redux'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { initialState as uiStatsInitialState } from 'domains/reporting/state/ui/stats/filtersSlice'
import { RootState } from 'state/types'
import { mockStore } from 'utils/testing'

describe('useStatsFilters', () => {
    const periodStart = moment()
    const periodEnd = periodStart.add(7, 'days')
    const period = {
        end_datetime: periodEnd.toISOString(),
        start_datetime: periodStart.toISOString(),
    }
    const defaultState = {
        stats: {
            filters: { period },
        },
        ui: {
            stats: { filters: uiStatsInitialState },
        },
    } as RootState

    it('should return filters with logical operators when no channels filter', () => {
        const state = {
            ...defaultState,
            stats: {
                filters: {
                    period,
                },
            },
        } as RootState

        const { result } = renderHook(() => useStatsFilters(), {
            wrapper: ({ children }) => (
                <Provider store={mockStore(state)}>{children}</Provider>
            ),
        })

        expect(result.current.cleanStatsFilters).toEqual({
            period: state.stats.filters.period,
            channels: undefined,
            agents: undefined,
            campaignStatuses: undefined,
            campaigns: undefined,
            customFields: undefined,
            helpCenters: undefined,
            localeCodes: undefined,
            integrations: withDefaultLogicalOperator([]),
        })
    })

    it('should return filters with logical operators', () => {
        const channels = ['api', 'email']
        const state = {
            ...defaultState,
            stats: {
                filters: {
                    period,
                    channels: withDefaultLogicalOperator(channels),
                },
            },
        } as RootState

        const { result } = renderHook(() => useStatsFilters(), {
            wrapper: ({ children }) => (
                <Provider store={mockStore(state)}>{children}</Provider>
            ),
        })

        expect(result.current.cleanStatsFilters).toEqual({
            ...state.stats.filters,
            agents: undefined,
            campaignStatuses: undefined,
            campaigns: undefined,
            customFields: undefined,
            helpCenters: undefined,
            localeCodes: undefined,
            integrations: withDefaultLogicalOperator([]),
        })
    })

    it('should return clean stats filters with logical operators', () => {
        const channels = ['api', 'email']
        const state = {
            ...defaultState,
            stats: {
                filters: {
                    period,
                    channels: withDefaultLogicalOperator(channels),
                },
            },
            ui: {
                stats: {
                    filters: {
                        ...uiStatsInitialState,
                        cleanStatsFilters: {
                            period,
                            channels: withDefaultLogicalOperator([
                                'anotherChannel',
                            ]),
                        },
                    },
                },
            },
        } as RootState

        const { result } = renderHook(() => useStatsFilters(), {
            wrapper: ({ children }) => (
                <Provider store={mockStore(state)}>{children}</Provider>
            ),
        })

        expect(result.current.cleanStatsFilters).toEqual({
            period: state.ui.stats.filters.cleanStatsFilters?.period,
            channels: state.ui.stats.filters.cleanStatsFilters?.channels,
        })
    })
})
