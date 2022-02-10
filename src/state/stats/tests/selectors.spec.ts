import {fromJS} from 'immutable'

import {RootState} from 'state/types'
import {TicketChannel} from 'business/types/ticket'
import {IntegrationType} from 'models/integration/constants'
import {StatsFilters} from 'models/stat/types'

import {
    getMessagingIntegrationsStatsFilter,
    getStatsFilters,
    getStatsMessagingIntegrations,
    getStatsStoreIntegrations,
    getStoreIntegrationsStatsFilter,
} from '../selectors'
import {initialState} from '../reducers'

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
                stats: defaultState.stats.set('filters', fromJS(statFilters)),
            }
            expect(getStatsFilters(state)).toEqual(statFilters)
        })
    })

    describe.each([
        [
            'getStatsMessagingIntegrations',
            'message',
            getStatsMessagingIntegrations,
        ],

        ['getStatsStoreIntegrations', 'store', getStatsStoreIntegrations],
    ])('%s', (testName, integrationType, selector) => {
        it('should return an empty array when integrations are not set', () => {
            expect(selector(defaultState)).toEqual([])
        })

        it(`should return only ${integrationType} integrations`, () => {
            const state = {
                ...defaultState,
                integrations: fromJS({
                    integrations: [
                        {
                            id: 1,
                            type: IntegrationType.Gmail,
                        },
                        {
                            id: 2,
                            type: IntegrationType.Shopify,
                        },
                    ],
                }),
            }
            expect(selector(state)).toMatchSnapshot()
        })
    })

    describe.each([
        [
            'getMessagingIntegrationsStatsFilter',
            'message',
            getMessagingIntegrationsStatsFilter,
        ],
        [
            'getStoreIntegrationsStatsFilter',
            'store',
            getStoreIntegrationsStatsFilter,
        ],
    ])('%s', (testName, integrationType, selector) => {
        it('should return an empty array when the stat filters are not set', () => {
            expect(selector(defaultState)).toEqual([])
        })

        it('should return an empty array when the integrations stat filter is not set', () => {
            const state: RootState = {
                ...defaultState,
                stats: defaultState.stats.set(
                    'filters',
                    fromJS({
                        ...defaultStatsFilters,
                        channels: [TicketChannel.Email],
                    })
                ),
            }
            expect(selector(state)).toEqual([])
        })

        it(`should return only ${integrationType} integrations`, () => {
            const state = {
                ...defaultState,
                stats: defaultState.stats.set(
                    'filters',
                    fromJS({
                        ...defaultStatsFilters,
                        integrations: [1, 2, 3],
                    })
                ),
                integrations: fromJS({
                    integrations: [
                        {
                            id: 1,
                            type: IntegrationType.Gmail,
                        },
                        {
                            id: 2,
                            type: IntegrationType.Shopify,
                        },
                    ],
                }),
            }
            expect(selector(state)).toMatchSnapshot()
        })
    })
})
