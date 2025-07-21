import { fromJS } from 'immutable'

import { TicketChannel } from 'business/types/ticket'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { StatsFiltersWithLogicalOperator } from 'domains/reporting/models/stat/types'
import {
    getMessagingAndAppIntegrationsStatsFilter,
    getPageStatsFilters,
    getPageStatsFiltersWithLogicalOperators,
    getSLAPoliciesStatsFilter,
    getStatsFilters,
    getStatsFiltersWithInitialStoreIntegration,
    getStatsMessagingAndAppIntegrations,
    getStatsStoreIntegrations,
    getStoreIntegrations,
    getStoreIntegrationsStatsFilter,
} from 'domains/reporting/state/stats/selectors'
import { initialState } from 'domains/reporting/state/stats/statsSlice'
import { automationSubscriptionProductPrices } from 'fixtures/account'
import * as billingFixtures from 'fixtures/billing'
import { IntegrationType } from 'models/integration/constants'
import { getIntegration } from 'pages/automate/workflows/hooks/tests/fixtures/utils'
import { initialState as billingInitialState } from 'state/billing/reducers'
import { RootState } from 'state/types'

jest.mock('moment-timezone', () => () => {
    const moment: (date: string) => Record<string, unknown> =
        jest.requireActual('moment-timezone')

    return moment('2019-09-03')
})

describe('stats selectors', () => {
    let defaultState: RootState
    const defaultStatsFilters = {
        period: { start_datetime: '0', end_datetime: '0' },
    } as StatsFiltersWithLogicalOperator
    const gmailIntegration = {
        id: 1,
        type: IntegrationType.Gmail,
    }
    const shopifyIntegration = {
        id: 2,
        type: IntegrationType.Shopify,
    }

    beforeEach(() => {
        defaultState = {
            stats: initialState,
        } as RootState
    })

    describe('getStatsFilters', () => {
        it('should return stats filters', () => {
            const statFilters: StatsFiltersWithLogicalOperator = {
                ...defaultStatsFilters,
                integrations: withDefaultLogicalOperator([1]),
            }
            const state = {
                ...defaultState,
                stats: { filters: statFilters },
            }

            expect(getStatsFilters(state)).toEqual({
                ...defaultStatsFilters,
                integrations: [1],
            })
        })
    })

    describe.each([
        [
            'getStatsMessagingAndAppIntegrations',
            'message',
            getStatsMessagingAndAppIntegrations,
            [gmailIntegration],
        ],
        [
            'getStatsStoreIntegrations',
            'store',
            getStatsStoreIntegrations,
            [shopifyIntegration],
        ],
    ])('%s', (testName, integrationType, selector, expectedIntegrations) => {
        it('should return an empty array when integrations are not set', () => {
            expect(selector(defaultState)).toEqual([])
        })

        it(`should return only ${integrationType} integrations`, () => {
            const state = {
                ...defaultState,
                integrations: fromJS({
                    integrations: [gmailIntegration, shopifyIntegration],
                }),
            }
            expect(selector(state)).toEqual(expectedIntegrations)
        })
    })

    describe('getStoreIntegrations', () => {
        it('should return only Shopify store integrations', () => {
            const state = {
                billing: billingInitialState.mergeDeep(
                    billingFixtures.billingState,
                ),
                integrations: fromJS({
                    integrations: [
                        getIntegration(1, IntegrationType.Shopify),
                        getIntegration(2, IntegrationType.BigCommerce),
                    ],
                }),
            } as RootState
            expect(getStoreIntegrations(state)).toEqual([
                getIntegration(1, IntegrationType.Shopify),
            ])
        })

        it('should return other store integrations values', () => {
            const state = {
                currentAccount: fromJS({
                    current_subscription: {
                        products: automationSubscriptionProductPrices,
                    },
                }),
                billing: billingInitialState.mergeDeep(
                    billingFixtures.billingState,
                ),
                integrations: fromJS({
                    integrations: [
                        getIntegration(1, IntegrationType.Shopify),
                        getIntegration(2, IntegrationType.BigCommerce),
                        getIntegration(3, IntegrationType.Magento2),
                    ],
                }),
            } as RootState
            expect(getStoreIntegrations(state)).toEqual([
                getIntegration(1, IntegrationType.Shopify),
                getIntegration(2, IntegrationType.BigCommerce),
                getIntegration(3, IntegrationType.Magento2),
            ])
        })
    })

    describe.each([
        [
            'getMessagingAndAppIntegrationsStatsFilter',
            'message',
            getMessagingAndAppIntegrationsStatsFilter,
            [gmailIntegration],
        ],
        [
            'getStoreIntegrationsStatsFilter',
            'store',
            getStoreIntegrationsStatsFilter,
            [shopifyIntegration],
        ],
    ])('%s', (testName, integrationType, selector, expectedIntegrations) => {
        it('should return an empty array when the stat filters are not set', () => {
            expect(selector(defaultState)).toEqual([])
        })

        it('should return an empty array when the integrations stat filter is not set', () => {
            const state: RootState = {
                ...defaultState,
                stats: {
                    filters: {
                        ...defaultStatsFilters,
                        channels: withDefaultLogicalOperator([
                            TicketChannel.Email,
                        ]),
                    },
                },
            }

            expect(selector(state)).toEqual([])
        })

        it(`should return only ${integrationType} integrations`, () => {
            const state = {
                ...defaultState,
                stats: {
                    filters: {
                        ...defaultStatsFilters,
                        integrations: withDefaultLogicalOperator([1, 2, 3]),
                    },
                },
                integrations: fromJS({
                    integrations: [gmailIntegration, shopifyIntegration],
                }),
            }

            expect(selector(state)).toEqual(
                expectedIntegrations.map((integration) => integration.id),
            )
        })
    })

    describe('getPageStatsFilters', () => {
        it('should return filters with Messaging and App integrations only', () => {
            const notMessagingNorAppIntegration = shopifyIntegration
            const nonExistentIntegrationId = 3
            const state = {
                ...defaultState,
                stats: {
                    filters: {
                        ...defaultStatsFilters,
                        integrations: withDefaultLogicalOperator([
                            gmailIntegration.id,
                            notMessagingNorAppIntegration.id,
                            nonExistentIntegrationId,
                        ]),
                    },
                },
                integrations: fromJS({
                    integrations: [gmailIntegration, shopifyIntegration],
                }),
            }

            expect(getPageStatsFilters(state)).toEqual({
                ...state.stats.filters,
                integrations: [gmailIntegration.id],
                agents: undefined,
                channels: undefined,
                tags: undefined,
                helpCenters: undefined,
                localeCodes: undefined,
                score: undefined,
                campaigns: undefined,
                campaignStatuses: undefined,
                slaPolicies: undefined,
            })
        })
    })

    describe('getStatsFiltersWithInitialStoreIntegration', () => {
        it('should return filters with initial store integration and store integrations', () => {
            const state = {
                ...defaultState,
                stats: {
                    filters: {
                        ...defaultStatsFilters,
                    },
                },
                integrations: fromJS({
                    integrations: [gmailIntegration, shopifyIntegration],
                }),
            }

            expect(getStatsFiltersWithInitialStoreIntegration(state)).toEqual({
                statsFilters: {
                    ...state.stats.filters,
                    integrations: [shopifyIntegration.id],
                },
                storeIntegrations: [shopifyIntegration],
            })
        })

        it('should return filters with selected store integration and store integrations', () => {
            const someIntegrationId = 34
            const someStoreIntegration = {
                id: someIntegrationId,
                type: IntegrationType.Shopify,
            }
            const state = {
                ...defaultState,
                stats: {
                    filters: {
                        ...defaultStatsFilters,
                        integrations: withDefaultLogicalOperator([
                            someIntegrationId,
                        ]),
                    },
                },
                integrations: fromJS({
                    integrations: [
                        gmailIntegration,
                        shopifyIntegration,
                        someStoreIntegration,
                    ],
                }),
            }

            expect(getStatsFiltersWithInitialStoreIntegration(state)).toEqual({
                statsFilters: {
                    ...state.stats.filters,
                    integrations: [someIntegrationId],
                },
                storeIntegrations: [shopifyIntegration, someStoreIntegration],
            })
        })
    })

    describe('getPageStatsFiltersWithLogicalOperators', () => {
        it('should return filters with logical operators and Messaging and App integrations only', () => {
            const notMessagingNorAppIntegration = shopifyIntegration
            const nonExistentIntegrationId = 3
            const state = {
                ...defaultState,
                stats: {
                    filters: {
                        ...defaultStatsFilters,
                        integrations: withDefaultLogicalOperator([
                            gmailIntegration.id,
                            notMessagingNorAppIntegration.id,
                            nonExistentIntegrationId,
                        ]),
                    },
                },
                integrations: fromJS({
                    integrations: [gmailIntegration, shopifyIntegration],
                }),
            }

            expect(getPageStatsFiltersWithLogicalOperators(state)).toEqual({
                ...state.stats.filters,
                integrations: withDefaultLogicalOperator([gmailIntegration.id]),
                agents: undefined,
                channels: undefined,
                tags: undefined,
                helpCenters: undefined,
                localeCodes: undefined,
                score: undefined,
                campaigns: undefined,
                campaignStatuses: undefined,
                slaPolicies: undefined,
            })
        })

        it('should return filters with logical operators even if integrations filter is missing', () => {
            const state = {
                ...defaultState,
                stats: {
                    filters: {
                        ...defaultStatsFilters,
                    },
                },
                integrations: fromJS({
                    integrations: [gmailIntegration, shopifyIntegration],
                }),
            }

            expect(getPageStatsFiltersWithLogicalOperators(state)).toEqual({
                ...state.stats.filters,
                integrations: withDefaultLogicalOperator([]),
                agents: undefined,
                channels: undefined,
                tags: undefined,
                helpCenters: undefined,
                localeCodes: undefined,
                score: undefined,
                campaigns: undefined,
                campaignStatuses: undefined,
                slaPolicies: undefined,
            })
        })
    })

    describe('getSLAPoliciesStatsFilter', () => {
        it('should return selected Sla policies ', () => {
            const state = {
                ...defaultState,
                stats: {
                    filters: {
                        ...defaultStatsFilters,
                        slaPolicies: withDefaultLogicalOperator([
                            '1',
                            '2',
                            '3',
                        ]),
                    },
                },
            }

            expect(getSLAPoliciesStatsFilter(state)).toEqual(
                state.stats.filters.slaPolicies.values,
            )
        })

        it('should return empty array when no policies selected', () => {
            const state = {
                ...defaultState,
                stats: initialState,
            }

            expect(getSLAPoliciesStatsFilter(state)).toEqual([])
        })
    })
})
