import React from 'react'

import { renderHook } from '@testing-library/react-hooks'
import { mockFlags } from 'jest-launchdarkly-mock'
import moment from 'moment'
import { Provider } from 'react-redux'

import { FeatureFlagKey } from 'config/featureFlags'
import { useNewStatsFilters } from 'hooks/reporting/support-performance/useNewStatsFilters'
import { withDefaultLogicalOperator } from 'models/reporting/queryFactories/utils'
import { RootState } from 'state/types'
import { initialState as uiStatsInitialState } from 'state/ui/stats/filtersSlice'
import { mockStore } from 'utils/testing'

describe('useNewStatsFilters', () => {
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

    beforeEach(() => {
        mockFlags({
            [FeatureFlagKey.AnalyticsNewFilters]: false,
        })
    })

    it('should return legacy filters and empty channels when the flag is off', () => {
        const { result } = renderHook(() => useNewStatsFilters(), {
            wrapper: ({ children }) => (
                <Provider store={mockStore(defaultState)}>{children}</Provider>
            ),
        })

        expect(result.current.cleanStatsFilters).toEqual({
            period: defaultState.stats.filters.period,
            channels: undefined,
            agents: undefined,
            campaignStatuses: undefined,
            campaigns: undefined,
            customFields: undefined,
            helpCenters: undefined,
            localeCodes: undefined,
        })
    })

    it('should return legacy filters when the flag is off', () => {
        const channels = ['1', '2']
        const state = {
            ...defaultState,
            stats: {
                filters: {
                    period,
                    channels: withDefaultLogicalOperator(channels),
                },
            },
        } as RootState

        const { result } = renderHook(() => useNewStatsFilters(), {
            wrapper: ({ children }) => (
                <Provider store={mockStore(state)}>{children}</Provider>
            ),
        })

        expect(result.current.cleanStatsFilters).toEqual({
            period: state.stats.filters.period,
            channels,
        })
    })

    it('should return legacy clean stats filters when the flag is off', () => {
        const channels = ['1', '2']
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

        const { result } = renderHook(() => useNewStatsFilters(), {
            wrapper: ({ children }) => (
                <Provider store={mockStore(state)}>{children}</Provider>
            ),
        })

        expect(result.current.cleanStatsFilters).toEqual({
            period: state.ui.stats.filters.cleanStatsFilters?.period,
            channels:
                state.ui.stats.filters.cleanStatsFilters?.channels?.values,
        })
    })

    it('should return legacy filters when the flag is off', () => {
        const channels = ['1', '2']
        const state = {
            ...defaultState,
            stats: {
                filters: {
                    period,
                    channels: withDefaultLogicalOperator(channels),
                },
            },
        } as RootState

        const { result } = renderHook(() => useNewStatsFilters(), {
            wrapper: ({ children }) => (
                <Provider store={mockStore(state)}>{children}</Provider>
            ),
        })

        expect(result.current.cleanStatsFilters).toEqual({
            period: state.stats.filters.period,
            channels,
        })
    })

    it('should return filters with logical operators when the flag is on and no channels filter', () => {
        mockFlags({
            [FeatureFlagKey.AnalyticsNewFilters]: true,
        })
        const state = {
            ...defaultState,
            stats: {
                filters: {
                    period,
                },
            },
        } as RootState

        const { result } = renderHook(() => useNewStatsFilters(), {
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

    it('should return filters with logical operators when the flag is on', () => {
        mockFlags({
            [FeatureFlagKey.AnalyticsNewFilters]: true,
        })
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

        const { result } = renderHook(() => useNewStatsFilters(), {
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

    it('should return clean stats filters with logical operators when the flag is on', () => {
        mockFlags({
            [FeatureFlagKey.AnalyticsNewFilters]: true,
        })
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

        const { result } = renderHook(() => useNewStatsFilters(), {
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
