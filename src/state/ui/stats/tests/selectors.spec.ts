import {fromJS} from 'immutable'
import {integrationsStateWithShopify} from 'fixtures/integrations'
import {user} from 'fixtures/users'
import {withDefaultLogicalOperator} from 'models/reporting/queryFactories/utils'
import {DEFAULT_TIMEZONE} from 'pages/stats/convert/constants/components'
import {initialState as currentUserInitialState} from 'state/currentUser/reducers'
import {STATS_STORE_INTEGRATION_TYPES} from 'state/stats/constants'
import {initialState as initialStatsFiltersState} from 'state/stats/statsSlice'
import {
    getPageStatsFilters,
    getPageStatsFiltersWithLogicalOperators,
} from 'state/stats/selectors'
import {fromFiltersWithLogicalOperators} from 'state/stats/utils'
import {RootState, StoreState} from 'state/types'
import {
    initialState as initialUiStatsState,
    initialState,
} from 'state/ui/stats/reducer'
import {
    getCleanStatsFilters,
    getCleanStatsFiltersWithInitialStoreIntegration,
    getCleanStatsFiltersWithLogicalOperatorsWithTimezone,
    getCleanStatsFiltersWithTimezone,
    isCleanStatsDirty,
} from 'state/ui/stats/selectors'

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
                agents: withDefaultLogicalOperator([123, 456]),
            }
            const state = {
                ...defaultState,
                ui: {
                    stats: {
                        ...initialUiStatsState,
                        cleanStatsFilters: cleanStatsFilters,
                    },
                },
            } as RootState

            expect(
                getCleanStatsFiltersWithTimezone(state).cleanStatsFilters
            ).toEqual(fromFiltersWithLogicalOperators(cleanStatsFilters))
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

    describe('getCleanStatsFiltersWithLogicalOperatorsWithTimezone', () => {
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
                getCleanStatsFiltersWithLogicalOperatorsWithTimezone(
                    defaultState
                ).cleanStatsFilters
            ).toEqual(getPageStatsFiltersWithLogicalOperators(defaultState))
        })

        it('should return cleanStatsFilters filters if defined', () => {
            const cleanStatsFilters = {
                period: {
                    start_datetime: '1970-01-01T00:00:00+00:00',
                    end_datetime: '1970-01-01T00:00:00+00:00',
                },
                agents: withDefaultLogicalOperator([123, 456]),
            }
            const state = {
                ...defaultState,
                ui: {
                    stats: {
                        ...initialUiStatsState,
                        cleanStatsFilters: cleanStatsFilters,
                    },
                },
            } as RootState
            expect(
                getCleanStatsFiltersWithLogicalOperatorsWithTimezone(state)
                    .cleanStatsFilters
            ).toEqual(cleanStatsFilters)
        })

        it('should return user`s Timezone', () => {
            expect(
                getCleanStatsFiltersWithLogicalOperatorsWithTimezone(
                    defaultState
                ).userTimezone
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
                getCleanStatsFiltersWithLogicalOperatorsWithTimezone(state)
                    .userTimezone
            ).toEqual(DEFAULT_TIMEZONE)
        })
    })

    describe('getCleanStatsFiltersWithInitialStoreIntegration', () => {
        it('should return integrations filter', () => {
            const selectedIntegrationId = 345
            const state = {
                ui: {
                    stats: {
                        ...initialUiStatsState,
                        cleanStatsFilters: {
                            period: initialStatsFiltersState.filters.period,
                            integrations: withDefaultLogicalOperator([
                                selectedIntegrationId,
                            ]),
                        },
                    },
                },
                stats: {
                    filters: {
                        period: initialStatsFiltersState.filters.period,
                        integrations: withDefaultLogicalOperator([
                            selectedIntegrationId,
                        ]),
                    },
                },
                integrations: integrationsStateWithShopify.mergeDeep({
                    integrations: [
                        {
                            id: selectedIntegrationId,
                            type: STATS_STORE_INTEGRATION_TYPES[0],
                        },
                    ],
                }),
            } as RootState

            expect(
                getCleanStatsFiltersWithInitialStoreIntegration(state)
                    .statsFilters.integrations
            ).toEqual([selectedIntegrationId])
        })

        it('should return integrations filter with first storeIntegration if not set', () => {
            const state = {
                ui: {
                    stats: initialUiStatsState,
                },
                stats: initialStatsFiltersState,
                integrations: integrationsStateWithShopify,
            } as unknown as RootState

            expect(
                getCleanStatsFiltersWithInitialStoreIntegration(state)
                    .statsFilters.integrations
            ).toEqual([
                integrationsStateWithShopify.getIn(['integrations', 0, 'id']),
            ])
        })
    })
})
