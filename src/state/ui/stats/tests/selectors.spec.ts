import {fromJS} from 'immutable'
import {user} from 'fixtures/users'
import {DEFAULT_TIMEZONE} from 'pages/stats/revenue/constants/components'
import {initialState as currentUserInitialState} from 'state/currentUser/reducers'
import {initialState as initialStatsFiltersState} from 'state/stats/reducers'
import {getPageStatsFilters} from 'state/stats/selectors'
import {RootState, StoreState} from 'state/types'
import {
    initialState as initialUiStatsState,
    initialState,
} from 'state/ui/stats/reducer'
import {
    getCleanStatsFilters,
    getCleanStatsFiltersWithTimezone,
    isCleanStatsDirty,
} from '../selectors'

const store = {
    ui: {
        stats: initialState,
    },
} as StoreState

describe('ui/stats/selectors', () => {
    describe('isCleanStatsDirty', () => {
        it('should return cleanStats dirty state', () => {
            expect(isCleanStatsDirty(store)).toEqual(initialState.isFilterDirty)
        })
    })

    describe('getCleanStatsFilters', () => {
        it('should return clean StatsFilters state', () => {
            expect(getCleanStatsFilters(store)).toEqual(
                initialState.cleanStatsFilters
            )
        })
    })

    describe('getCleanStatsFiltersWithTimezone', () => {
        const defaultState = {
            currentUser: currentUserInitialState.mergeDeep(
                fromJS({
                    ...user,
                    _internal: {
                        loading: {
                            settings: {
                                preferences: true,
                            },
                            currentUser: true,
                        },
                    },
                })
            ),
            ui: {
                stats: initialUiStatsState,
            },
            stats: initialStatsFiltersState,
        } as RootState

        it('should return pageStatsFilters if no cleanStatsFilters are stored', () => {
            expect(
                getCleanStatsFiltersWithTimezone(defaultState).cleanStatsFilters
            ).toEqual(getPageStatsFilters(defaultState))
        })

        it('should return cleanStatsFilters filters if defined', () => {
            const cleanStatsFilters = {
                period: {
                    start_datetime: '1970-01-01T00:00:00+00:00',
                    end_datetime: '1970-01-01T00:00:00+00:00',
                },
                agents: [123, 456],
            }
            const state = {
                ...defaultState,
                ui: {
                    stats: {
                        ...initialUiStatsState,
                        cleanStatsFilters,
                    },
                },
            } as RootState
            expect(
                getCleanStatsFiltersWithTimezone(state).cleanStatsFilters
            ).toEqual(cleanStatsFilters)
        })

        it('should return user`s Timezone', () => {
            expect(
                getCleanStatsFiltersWithTimezone(defaultState).userTimezone
            ).toEqual(user.timezone)
        })

        it('should return default timezone if no user`s Timezone', () => {
            const state = {
                currentUser: currentUserInitialState.mergeDeep(
                    fromJS({
                        ...{...user, timezone: null},
                        _internal: {
                            loading: {
                                settings: {
                                    preferences: true,
                                },
                                currentUser: true,
                            },
                        },
                    })
                ),
                ui: {
                    stats: initialUiStatsState,
                },
                stats: initialStatsFiltersState,
            } as RootState

            expect(
                getCleanStatsFiltersWithTimezone(state).userTimezone
            ).toEqual(DEFAULT_TIMEZONE)
        })
    })
})
