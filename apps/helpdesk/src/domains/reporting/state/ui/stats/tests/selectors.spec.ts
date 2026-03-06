import { fromJS } from 'immutable'

import {
    withDefaultLogicalOperator,
    withLogicalOperator,
} from 'domains/reporting/models/queryFactories/utils'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { DEFAULT_TIMEZONE } from 'domains/reporting/pages/convert/constants/components'
import { STATS_STORE_INTEGRATION_TYPES } from 'domains/reporting/state/stats/constants'
import {
    getPageStatsFilters,
    getPageStatsFiltersWithLogicalOperators,
} from 'domains/reporting/state/stats/selectors'
import { initialState as initialStatsFiltersState } from 'domains/reporting/state/stats/statsSlice'
import { fromFiltersWithLogicalOperators } from 'domains/reporting/state/stats/utils'
import { initialState } from 'domains/reporting/state/ui/stats/filtersSlice'
import {
    getCleanStatsFilters,
    getCleanStatsFiltersWithInitialStoreIntegration,
    getCleanStatsFiltersWithLogicalOperatorsWithTimezone,
    getCleanStatsFiltersWithTimezone,
    isCleanStatsDirty,
} from 'domains/reporting/state/ui/stats/selectors'
import { integrationsStateWithShopify } from 'fixtures/integrations'
import { user } from 'fixtures/users'
import { initialState as currentUserInitialState } from 'state/currentUser/reducers'
import type { RootState, StoreState } from 'state/types'

const store = {
    ui: {
        stats: { filters: initialState },
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
                initialState.cleanStatsFilters,
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
                }),
            ),
            ui: {
                stats: { filters: initialState },
            },
            stats: initialStatsFiltersState,
        } as RootState

        it('should return pageStatsFilters if no cleanStatsFilters are stored', () => {
            expect(
                getCleanStatsFiltersWithTimezone(defaultState)
                    .cleanStatsFilters,
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
                        filters: {
                            ...initialState,
                            cleanStatsFilters: cleanStatsFilters,
                        },
                    },
                },
            } as RootState

            expect(
                getCleanStatsFiltersWithTimezone(state).cleanStatsFilters,
            ).toEqual(fromFiltersWithLogicalOperators(cleanStatsFilters))
        })

        it('should return user`s Timezone', () => {
            expect(
                getCleanStatsFiltersWithTimezone(defaultState).userTimezone,
            ).toEqual(user.timezone)
        })

        it('should return default timezone if no user`s Timezone', () => {
            const state = {
                currentUser: currentUserInitialState.mergeDeep(
                    fromJS({
                        ...user,
                        timezone: null,
                        _internal: {
                            loading: {
                                settings: { preferences: true },
                                currentUser: true,
                            },
                        },
                    }),
                ),
                ui: {
                    stats: { filters: initialState },
                },
                stats: initialStatsFiltersState,
            } as RootState

            expect(
                getCleanStatsFiltersWithTimezone(state).userTimezone,
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
                }),
            ),
            ui: {
                stats: { filters: initialState },
            },
            stats: initialStatsFiltersState,
        } as RootState

        it('should return pageStatsFilters if no cleanStatsFilters are stored', () => {
            expect(
                getCleanStatsFiltersWithLogicalOperatorsWithTimezone(
                    defaultState,
                ).cleanStatsFilters,
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
                        filters: {
                            ...initialState,
                            cleanStatsFilters: cleanStatsFilters,
                        },
                    },
                },
            } as RootState
            expect(
                getCleanStatsFiltersWithLogicalOperatorsWithTimezone(state)
                    .cleanStatsFilters,
            ).toEqual(cleanStatsFilters)
        })

        it('should return user`s Timezone', () => {
            expect(
                getCleanStatsFiltersWithLogicalOperatorsWithTimezone(
                    defaultState,
                ).userTimezone,
            ).toEqual(user.timezone)
        })

        it('should return default timezone if no user`s Timezone', () => {
            const state = {
                currentUser: currentUserInitialState.mergeDeep(
                    fromJS({
                        ...user,
                        timezone: null,
                        _internal: {
                            loading: {
                                settings: { preferences: true },
                                currentUser: true,
                            },
                        },
                    }),
                ),
                ui: {
                    stats: { filters: initialState },
                },
                stats: initialStatsFiltersState,
            } as RootState

            expect(
                getCleanStatsFiltersWithLogicalOperatorsWithTimezone(state)
                    .userTimezone,
            ).toEqual(DEFAULT_TIMEZONE)
        })
    })

    describe('getCleanStatsFiltersWithInitialStoreIntegration', () => {
        it('should return integrations filter using withDefaultLogicalOperator', () => {
            const selectedIntegrationId = 345
            const state = {
                ui: {
                    stats: {
                        filters: {
                            ...initialState,
                            cleanStatsFilters: {
                                period: initialStatsFiltersState.filters.period,
                                integrations: withDefaultLogicalOperator([
                                    selectedIntegrationId,
                                ]),
                            },
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
                    .statsFilters.integrations,
            ).toEqual([selectedIntegrationId])
        })

        it('should return integrations filter using withLogicalOperator', () => {
            const selectedIntegrationId = 345
            const state = {
                ui: {
                    stats: {
                        filters: {
                            ...initialState,
                            cleanStatsFilters: {
                                period: initialStatsFiltersState.filters.period,
                                integrations: withLogicalOperator([
                                    selectedIntegrationId,
                                ]),
                            },
                        },
                    },
                },
                stats: {
                    filters: {
                        period: initialStatsFiltersState.filters.period,
                        integrations: withLogicalOperator([
                            selectedIntegrationId,
                            LogicalOperatorEnum.NOT_ONE_OF,
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
                    .statsFilters.integrations,
            ).toEqual([selectedIntegrationId])
        })

        it('should return integrations filter with first storeIntegration if not set', () => {
            const state = {
                ui: {
                    stats: { filters: initialState },
                },
                stats: initialStatsFiltersState,
                integrations: integrationsStateWithShopify,
            } as unknown as RootState

            expect(
                getCleanStatsFiltersWithInitialStoreIntegration(state)
                    .statsFilters.integrations,
            ).toEqual([
                integrationsStateWithShopify.getIn(['integrations', 0, 'id']),
            ])
        })
    })
})
