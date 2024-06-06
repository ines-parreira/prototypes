import {fromJS} from 'immutable'

import {RootState} from 'state/types'
import {TicketChannel} from 'business/types/ticket'
import {IntegrationType} from 'models/integration/constants'
import {StatsFilters} from 'models/stat/types'

import {
    getStatsFilters,
    getStatsStoreIntegrations,
    getStoreIntegrationsStatsFilter,
    getMessagingAndAppIntegrationsStatsFilter,
    getStatsMessagingAndAppIntegrations,
    getSLAPoliciesStatsFilter,
    getPageStatsFilters,
} from 'state/stats/selectors'
import {initialState} from 'state/stats/statsSlice'

jest.mock('moment-timezone', () => () => {
    const moment: (date: string) => Record<string, unknown> =
        jest.requireActual('moment-timezone')

    return moment('2019-09-03')
})

describe('stats selectors', () => {
    let defaultState: RootState
    const defaultStatsFilters = {
        period: {start_datetime: '0', end_datetime: '0'},
    } as StatsFilters
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
            const statFilters: StatsFilters = {
                ...defaultStatsFilters,
                integrations: [1],
            }
            const state = {
                ...defaultState,
                stats: {filters: statFilters},
            }

            expect(getStatsFilters(state)).toEqual(statFilters)
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
                        channels: [TicketChannel.Email],
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
                        integrations: [1, 2, 3],
                    },
                },
                integrations: fromJS({
                    integrations: [gmailIntegration, shopifyIntegration],
                }),
            }
            expect(selector(state)).toEqual(
                expectedIntegrations.map((integration) => integration.id)
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
                        integrations: [
                            gmailIntegration.id,
                            notMessagingNorAppIntegration.id,
                            nonExistentIntegrationId,
                        ],
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
                        slaPolicies: ['1', '2', '3'],
                    },
                },
            }

            expect(getSLAPoliciesStatsFilter(state)).toEqual(
                state.stats.filters.slaPolicies
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
