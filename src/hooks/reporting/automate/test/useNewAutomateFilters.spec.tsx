import {renderHook} from '@testing-library/react-hooks'
import {mockFlags} from 'jest-launchdarkly-mock'
import moment from 'moment'
import React from 'react'
import {Provider} from 'react-redux'

import {FeatureFlagKey} from 'config/featureFlags'
import {useNewAutomateFilters} from 'hooks/reporting/automate/useNewAutomateFilters'
import {withDefaultLogicalOperator} from 'models/reporting/queryFactories/utils'
import {RootState} from 'state/types'
import {initialState as uiFiltersInitialState} from 'state/ui/stats/filtersSlice'
import {mockStore} from 'utils/testing'

describe('useNewAutomateFilters', () => {
    const periodStart = moment()
    const periodEnd = periodStart.add(7, 'days')
    const period = {
        end_datetime: periodEnd.toISOString(),
        start_datetime: periodStart.toISOString(),
    }
    const defaultState = {
        stats: {
            filters: {period},
        },
        ui: {
            stats: {filters: uiFiltersInitialState},
        },
    } as RootState

    beforeEach(() => {
        mockFlags({
            [FeatureFlagKey.AnalyticsNewFiltersAutomate]: false,
        })
    })

    it('should return legacy filters and empty channels when the flag is off', () => {
        const {result} = renderHook(() => useNewAutomateFilters(), {
            wrapper: ({children}) => (
                <Provider store={mockStore(defaultState)}>{children}</Provider>
            ),
        })

        expect(result.current.statsFilters).toEqual({
            period: defaultState.stats.filters.period,
            channels: [],
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

        const {result} = renderHook(() => useNewAutomateFilters(), {
            wrapper: ({children}) => (
                <Provider store={mockStore(state)}>{children}</Provider>
            ),
        })

        expect(result.current.statsFilters).toEqual({
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
                        ...uiFiltersInitialState,
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

        const {result} = renderHook(() => useNewAutomateFilters(), {
            wrapper: ({children}) => (
                <Provider store={mockStore(state)}>{children}</Provider>
            ),
        })

        expect(result.current.statsFilters).toEqual({
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

        const {result} = renderHook(() => useNewAutomateFilters(), {
            wrapper: ({children}) => (
                <Provider store={mockStore(state)}>{children}</Provider>
            ),
        })

        expect(result.current.statsFilters).toEqual({
            period: state.stats.filters.period,
            channels,
        })
    })

    it('should return filters with logical operators when the flag is on and no channels filter', () => {
        mockFlags({
            [FeatureFlagKey.AnalyticsNewFiltersAutomate]: true,
        })
        const state = {
            ...defaultState,
            stats: {
                filters: {
                    period,
                },
            },
        } as RootState

        const {result} = renderHook(() => useNewAutomateFilters(), {
            wrapper: ({children}) => (
                <Provider store={mockStore(state)}>{children}</Provider>
            ),
        })

        expect(result.current.statsFilters).toEqual({
            period: state.stats.filters.period,
            channels: withDefaultLogicalOperator([]),
        })
    })

    it('should return filters with logical operators when the flag is on', () => {
        mockFlags({
            [FeatureFlagKey.AnalyticsNewFiltersAutomate]: true,
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

        const {result} = renderHook(() => useNewAutomateFilters(), {
            wrapper: ({children}) => (
                <Provider store={mockStore(state)}>{children}</Provider>
            ),
        })

        expect(result.current.statsFilters).toEqual(state.stats.filters)
    })

    it('should return clean stats filters with logical operators when the flag is on', () => {
        mockFlags({
            [FeatureFlagKey.AnalyticsNewFiltersAutomate]: true,
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
                        ...uiFiltersInitialState,
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

        const {result} = renderHook(() => useNewAutomateFilters(), {
            wrapper: ({children}) => (
                <Provider store={mockStore(state)}>{children}</Provider>
            ),
        })

        expect(result.current.statsFilters).toEqual({
            period: state.ui.stats.filters.cleanStatsFilters?.period,
            channels: state.ui.stats.filters.cleanStatsFilters?.channels,
        })
    })
})
